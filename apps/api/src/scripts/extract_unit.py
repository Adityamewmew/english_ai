import fitz
import base64
import requests
import json
import os
import sys

# Ensure UTF-8 output on Windows terminal
sys.stdout.reconfigure(encoding='utf-8')

PROXY_URL = os.getenv("AI_BASE_URL", "http://localhost:20128/v1").rstrip("/") + "/chat/completions"
API_KEY = os.getenv("AI_API_KEY", "")
MODEL = "kr/claude-sonnet-4.5"

def extract_unit(pdf_path, start_page, end_page, unit_id, level_id, unit_title, order_index):
    """
    Renders pages start_page..end_page of pdf_path as base64 images,
    then prompts Vision LLM to return exact monorepo-compatible module JSON.
    """
    if not os.path.exists(pdf_path):
        print(f"Error: File not found: {pdf_path}")
        return None

    doc = fitz.open(pdf_path)
    image_contents = []

    for p in range(start_page, min(end_page + 1, len(doc))):
        pix = doc[p].get_pixmap(dpi=110)
        b64 = base64.b64encode(pix.tobytes("jpeg")).decode("utf-8")
        image_contents.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
        })

    prompt_text = f"""
You are an expert Cambridge ELT curriculum architect.
Analyze all provided book pages for "{unit_title}" (Unit {order_index}, Level {level_id}).
Extract and transform the exact content into our application's standard JSON format.

JSON Requirements:
{{
  "id": "{unit_id}",
  "levelId": "{level_id}",
  "title": "{unit_title}",
  "cefr": "{level_id}",
  "group": "Foundations",
  "objective": "Clear Indonesian explanation of the learning outcome (e.g. Mampu memperkenalkan diri, menggunakan to be...)",
  "orderIndex": {order_index},
  "sections": {{
    "theory": {{
      "summary": "Clear, encouraging explanation of the core concept in Indonesian.",
      "rules": [
        "Rule 1 with formula and pattern",
        "Rule 2 with example"
      ],
      "commonTrap": {{
        "trapTitle": "Peringatan Kesalahan Umum",
        "explanation": "Penjelasan jebakan umum pemula",
        "wrong": "Contoh salah dari buku",
        "correct": "Contoh benar yang baku"
      }}
    }},
    "vocab": [
      {{
        "word": "English word from the unit vocabulary list",
        "ipa": "/phonetic/",
        "meaning": "Arti kata dalam Bahasa Indonesia",
        "collocation": "Short natural example sentence from the book"
      }}
    ],
    "dialogue": {{
      "context": "Situasi percakapan kontekstual dalam Bahasa Indonesia",
      "lines": [
        {{ "speaker": "SpeakerName", "text": "English line", "translation": "Terjemahan Indonesia" }}
      ]
    }},
    "speakingLab": {{
      "context": "Situasi latihan simulasi peran berbicara",
      "roles": ["Mr. Khoirul", "You"],
      "defaultUserRole": "You",
      "turns": [
        {{ "speaker": "Mr. Khoirul", "text": "Tutor opening question in English" }},
        {{ "speaker": "You", "text": "Student response model in English" }},
        {{ "speaker": "Mr. Khoirul", "text": "Tutor follow-up question in English" }},
        {{ "speaker": "You", "text": "Student second response model in English" }}
      ]
    }},
    "quiz": [
      {{
        "question": "Question text based on unit exercises",
        "options": ["Option A", "Option B", "Option C"],
        "answer": "Exact matching string from options",
        "explanation": "Penjelasan mengapa jawaban ini tepat"
      }}
    ]
  }}
}}

CRITICAL RULES:
1. ONLY return pure JSON inside ```json ... ``` codeblock. No introductory conversational text.
2. Include at least 6-8 core vocabulary words found on these pages.
3. Include at least 3-4 quiz questions directly adapted from the book exercises.
4. Keep the roleplay speaking turns realistic, gentle, and friendly for beginners.
"""

    user_content = [{"type": "text", "text": prompt_text}] + image_contents

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": user_content}],
        "max_tokens": 4000,
        "temperature": 0.2
    }

    print(f"Calling Vision API ({len(image_contents)} pages: {start_page}-{end_page})...")
    res = requests.post(PROXY_URL, headers=headers, json=payload, timeout=120)

    if not res.ok:
        print(f"API Error ({res.status_code}): {res.text[:300]}")
        return None

    raw_reply = res.json()["choices"][0]["message"]["content"]

    # Extract JSON block
    if "```json" in raw_reply:
        json_str = raw_reply.split("```json")[1].split("```")[0].strip()
    elif "```" in raw_reply:
        json_str = raw_reply.split("```")[1].split("```")[0].strip()
    else:
        json_str = raw_reply.strip()

    try:
        data = json.loads(json_str)
        return data
    except Exception as e:
        print(f"JSON Parse Error: {e}\nRaw Reply:\n{raw_reply[:400]}")
        return None

if __name__ == "__main__":
    pdf = "pdf_raw/LEVEL SMP-SMA (Think Starter - Think 5)/think Starter.pdf"
    # Unit 1 is pages 14 to 21
    res = extract_unit(
        pdf_path=pdf,
        start_page=14,
        end_page=21,
        unit_id="A1-M01",
        level_id="A1",
        unit_title="One World: Countries, Nationalities & To Be",
        order_index=1
    )
    if res:
        out_dir = "data/client_curriculum"
        os.makedirs(out_dir, exist_ok=True)
        out_file = os.path.join(out_dir, "A1-M01.json")
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(res, f, indent=2, ensure_ascii=False)
        print(f"SUCCESS! Extracted Unit 1 saved to: {out_file}")
        print("Summary:", res.get("title"), "| Vocab items:", len(res.get("sections", {}).get("vocab", [])))
        print("Quiz questions:", len(res.get("sections", {}).get("quiz", [])))
