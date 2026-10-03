import fitz
import base64
import requests
import json
import os
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

def load_env():
    env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k not in os.environ:
                        os.environ[k] = v

load_env()

PROXY_URL = os.getenv("AI_BASE_URL", "http://localhost:20128/v1").rstrip("/") + "/chat/completions"
API_KEY = os.getenv("AI_API_KEY", "")
MODEL = "kr/claude-sonnet-4.5"

# Think Starter Unit Page Offsets:
# Book page 13 is PDF page 14. Each unit is 8 pages.
THINK_STARTER_UNITS = [
    {"num": 1, "start": 14, "end": 21, "title": "One World: Countries, Nationalities & To Be"},
    {"num": 2, "start": 22, "end": 29, "title": "I Feel Happy: Feelings, Adjectives & Questions"},
    {"num": 3, "start": 30, "end": 37, "title": "Me and My Family: Family Members & Possessives"},
    {"num": 4, "start": 38, "end": 45, "title": "In the City: Places in Town & There is / There are"},
    {"num": 5, "start": 46, "end": 53, "title": "Daily Routines: Present Simple & Time Expressions"},
    {"num": 6, "start": 54, "end": 61, "title": "Free Time: Hobbies, Like + -ing & Can / Can't"},
    {"num": 7, "start": 62, "end": 69, "title": "Sport & Health: Sports & Adverbs of Frequency"},
    {"num": 8, "start": 70, "end": 77, "title": "Music & Style: Clothes & Present Continuous"},
    {"num": 9, "start": 78, "end": 85, "title": "Food & Drink: Countable / Uncountable & Some / Any"},
    {"num": 10, "start": 86, "end": 93, "title": "Past Memories: Was / Were & Past Time Phrases"},
    {"num": 11, "start": 94, "end": 101, "title": "Animal World: Past Simple Regular Verbs"},
    {"num": 12, "start": 102, "end": 109, "title": "Travel & Transport: Comparatives & Superlatives"}
]

# Think 1 Unit Page Offsets:
# Exact pages verified from TOC:
THINK_1_UNITS = [
    {"num": 1, "start": 13, "end": 20, "title": "Having Fun: Present Tenses & Hobbies"},
    {"num": 2, "start": 21, "end": 28, "title": "Money & Shopping: Past Simple & Buying Things"},
    {"num": 3, "start": 31, "end": 38, "title": "Food for Life: Quantifiers, Too & Not Enough"},
    {"num": 4, "start": 39, "end": 46, "title": "Family Ties: Comparatives & Family Relationships"},
    {"num": 5, "start": 49, "end": 56, "title": "It Feels Like Home: Homes, Furniture & Past Continuous"},
    {"num": 6, "start": 57, "end": 64, "title": "Best Friends: Friendship, Have to & Don't Have to"},
    {"num": 7, "start": 67, "end": 74, "title": "The Easy Life: Technology, Gadgets & Future with Will"},
    {"num": 8, "start": 75, "end": 82, "title": "Sporting Moments: Sports, Rules & Modals of Advice"},
    {"num": 9, "start": 85, "end": 92, "title": "The Wonders of the World: Nature, Geography & First Conditional"},
    {"num": 10, "start": 93, "end": 100, "title": "Around Town: Places in Town & Present Perfect with Ever/Never"},
    {"num": 11, "start": 103, "end": 110, "title": "Future Bodies: Health, Illness & Present Perfect vs Past Simple"},
    {"num": 12, "start": 111, "end": 118, "title": "Travellers' Tales: Travel, Transport & Relative Clauses"}
]

# Think 2 Unit Page Offsets (Level B1):
# Verified: PDF page 8 is printed page 12 (Unit 1: Amazing People)
THINK_2_UNITS = [
    {"num": 1, "start": 8, "end": 15, "title": "Amazing People: Present Tenses & Personality"},
    {"num": 2, "start": 16, "end": 23, "title": "The Way We Are: Past Simple, Continuous & Habitual"},
    {"num": 3, "start": 26, "end": 33, "title": "That's Entertainment: Comparatives & Superlatives"},
    {"num": 4, "start": 34, "end": 41, "title": "Social Networking: Present Perfect with For & Since"},
    {"num": 5, "start": 44, "end": 51, "title": "My Life in Music: Present Perfect vs Past Simple"},
    {"num": 6, "start": 52, "end": 59, "title": "Making a Difference: Future Forms - Will, Going to, Present Continuous"},
    {"num": 7, "start": 62, "end": 69, "title": "Future Fun: First Conditional with If, When & Unless"},
    {"num": 8, "start": 70, "end": 77, "title": "Science Counts: Modals of Ability & Obligation"},
    {"num": 9, "start": 80, "end": 87, "title": "What a Job!: Second Conditional & Work Vocabulary"},
    {"num": 10, "start": 88, "end": 95, "title": "Keep Healthy: Past Perfect & Health Vocabulary"},
    {"num": 11, "start": 98, "end": 105, "title": "Making the News: Passive Voice - Present & Past Simple"},
    {"num": 12, "start": 106, "end": 113, "title": "Playing by the Rules: Reported Speech & Sport Rules"}
]

# Think 3 Unit Page Offsets (Level B2):
# Verified: PDF page 13 is printed page 12 (Unit 1: Life Plans)
THINK_3_UNITS = [
    {"num": 1, "start": 13, "end": 20, "title": "Life Plans: Present Tenses for Future & Ambitions"},
    {"num": 2, "start": 21, "end": 28, "title": "Hard Times: Past Simple & Past Continuous"},
    {"num": 3, "start": 31, "end": 38, "title": "What's in a Name?: Present Perfect with Already & Yet"},
    {"num": 4, "start": 39, "end": 46, "title": "Dilemmas: First & Second Conditional"},
    {"num": 5, "start": 49, "end": 56, "title": "What a Story!: Past Perfect & Narrative Tenses"},
    {"num": 6, "start": 57, "end": 64, "title": "How Do They Do It?: Passive Voice Present & Past"},
    {"num": 7, "start": 67, "end": 74, "title": "All the Same?: Modals of Deduction - Must, Might, Can't"},
    {"num": 8, "start": 75, "end": 82, "title": "It's a Crime: Relative Clauses Defining & Non-defining"},
    {"num": 9, "start": 85, "end": 92, "title": "What Happened?: Third Conditional & Regrets"},
    {"num": 10, "start": 93, "end": 100, "title": "Money: Reported Speech Statements"},
    {"num": 11, "start": 103, "end": 110, "title": "Help!: Reported Questions & Requests"},
    {"num": 12, "start": 111, "end": 118, "title": "A First Time for Everything: Wish / If Only & Future in the Past"}
]

# Think 4 Unit Page Offsets (Level C1):
# Verified: PDF page 8 is Unit 1 (Survival)
THINK_4_UNITS = [
    {"num": 1, "start": 8, "end": 15, "title": "Survival: Verbs with Gerund & Infinitive"},
    {"num": 2, "start": 16, "end": 23, "title": "Going Places: Relative Clauses & Travel"},
    {"num": 3, "start": 26, "end": 33, "title": "The Next Generation: Future Continuous & Future Perfect"},
    {"num": 4, "start": 34, "end": 41, "title": "Thinking Outside the Box: Modals of Deduction & Speculation"},
    {"num": 5, "start": 44, "end": 51, "title": "Screen Time: Conditionals with Conjunctions & Technology"},
    {"num": 6, "start": 52, "end": 59, "title": "Bringing People Together: Gerunds, Infinitives & Community"},
    {"num": 7, "start": 62, "end": 69, "title": "Always Look on the Bright Side: Ways of Referring to Future & Optimism"},
    {"num": 8, "start": 70, "end": 77, "title": "Making Lists: Participle Clauses & Organization"},
    {"num": 9, "start": 80, "end": 87, "title": "Be Your Own Life Coach: Mixed Conditionals & Personal Growth"},
    {"num": 10, "start": 88, "end": 95, "title": "Spreading the News: Passive Report Structures & Media"},
    {"num": 11, "start": 98, "end": 105, "title": "Space and Beyond: Inversion with Negative Adverbials & Science"},
    {"num": 12, "start": 106, "end": 113, "title": "More to Explore: Emphatic Structures, Cleft Sentences & Discovery"}
]

# Think 5 Unit Page Offsets (Level C2):
# Verified: PDF page 12 is Unit 1 (Family Matters) from 2nd edition Cambridge
THINK_5_UNITS = [
    {"num": 1, "start": 12, "end": 19, "title": "Family Matters: Habitual Actions & Family Dynamics"},
    {"num": 2, "start": 20, "end": 27, "title": "Sweet Dreams: Narrative Tenses & Psychology of Sleep"},
    {"num": 3, "start": 30, "end": 37, "title": "Lucky for Some?: Advanced Conditionals & Probability"},
    {"num": 4, "start": 38, "end": 45, "title": "Having a Laugh: Humor, Irony & Emphasis with Clefts"},
    {"num": 5, "start": 48, "end": 55, "title": "What a Thrill!: Risk, Fear & Participle Clauses"},
    {"num": 6, "start": 56, "end": 63, "title": "Famous Lives: Inversion, Passive & Biographies"},
    {"num": 7, "start": 66, "end": 73, "title": "A Thing of Beauty?: Aesthetics, Perception & Modals"},
    {"num": 8, "start": 74, "end": 81, "title": "Cracking the Code: Language, Cryptography & Concession"},
    {"num": 9, "start": 84, "end": 91, "title": "Fairness Matters: Justice, Ethics & Relative Structures"},
    {"num": 10, "start": 92, "end": 99, "title": "Learning for Life: Education, Memory & Nominalization"},
    {"num": 11, "start": 102, "end": 109, "title": "The Modern World: Society, Trends & Complex Syntax"},
    {"num": 12, "start": 110, "end": 117, "title": "Celebrating Heroes: Mastery of Rhetoric, Nuance & Proficiency Exam"}
]

def extract_single_unit(doc, u_info, level_id):
    start_p = u_info["start"]
    end_p = u_info["end"]
    unit_num = u_info["num"]
    title = u_info["title"]
    module_id = f"{level_id}-M{unit_num:02d}"

    image_contents = []
    for p in range(start_p, min(end_p + 1, len(doc))):
        pix = doc[p].get_pixmap(dpi=110)
        b64 = base64.b64encode(pix.tobytes("jpeg")).decode("utf-8")
        image_contents.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
        })

    prompt_text = f"""
You are an expert Cambridge ELT author.
Analyze these 8 pages from Think (Level {level_id}, Unit {unit_num}: "{title}").
Extract the content into this EXACT JSON structure:

{{
  "id": "{module_id}",
  "levelId": "{level_id}",
  "title": "Unit {unit_num}: {title}",
  "cefr": "{level_id}",
  "group": "Core Units",
  "objective": "Tujuan pembelajaran dalam Bahasa Indonesia (contoh: Mampu...)",
  "orderIndex": {unit_num},
  "sections": {{
    "theory": {{
      "summary": "Ringkasan konsep utama unit dalam Bahasa Indonesia yang ramah.",
      "rules": [
        "Pola rumus 1 beserta contoh",
        "Pola rumus 2 beserta contoh"
      ],
      "commonTrap": {{
        "trapTitle": "Kesalahan Umum Pemula",
        "explanation": "Penjelasan jebakan pemula terkait materi ini",
        "wrong": "Kalimat yang sering salah dipakai pemula",
        "correct": "Kalimat yang baku dan tepat"
      }}
    }},
    "vocab": [
      {{
        "word": "kata",
        "ipa": "/fonetik/",
        "meaning": "arti dalam bahasa indonesia",
        "collocation": "contoh kalimat alami dari buku"
      }}
    ],
    "dialogue": {{
      "context": "Konteks situasi percakapan dalam Bahasa Indonesia",
      "lines": [
        {{ "speaker": "Nama1", "text": "English line", "translation": "Arti Indonesia" }},
        {{ "speaker": "Nama2", "text": "English line", "translation": "Arti Indonesia" }}
      ]
    }},
    "speakingLab": {{
      "context": "Situasi latihan simulasi peran percakapan dengan AI",
      "roles": ["Mr. Khoirul", "You"],
      "defaultUserRole": "You",
      "turns": [
        {{ "speaker": "Mr. Khoirul", "text": "Pertanyaan pembuka tutor dalam bahasa Inggris" }},
        {{ "speaker": "You", "text": "Respon siswa dalam bahasa Inggris" }},
        {{ "speaker": "Mr. Khoirul", "text": "Pertanyaan lanjutan tutor dalam bahasa Inggris" }},
        {{ "speaker": "You", "text": "Respon siswa kedua dalam bahasa Inggris" }}
      ]
    }},
    "quiz": [
      {{
        "question": "Kalimat soal latihan pilihan ganda",
        "options": ["Opsi A", "Opsi B", "Opsi C"],
        "answer": "Opsi yang benar persis sama",
        "explanation": "Penjelasan jawaban benar dalam Bahasa Indonesia"
      }}
    ]
  }}
}}

CRITICAL RULES:
1. ONLY return pure JSON inside ```json ... ``` codeblock.
2. Provide 6-8 core vocabulary items from these pages.
3. Provide 4-6 quiz questions testing the unit grammar/vocab.
4. Keep the roleplay realistic, gentle, and encouraging for students.
"""

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": [{"type": "text", "text": prompt_text}] + image_contents}],
        "max_tokens": 4000,
        "temperature": 0.2
    }

    for attempt in range(3):
        try:
            print(f"  -> Extracting {module_id} ({title}) [Attempt {attempt+1}]...")
            res = requests.post(PROXY_URL, headers=headers, json=payload, timeout=120)
            if res.ok:
                raw_reply = res.json()["choices"][0]["message"]["content"]
                if "```json" in raw_reply:
                    json_str = raw_reply.split("```json")[1].split("```")[0].strip()
                elif "```" in raw_reply:
                    json_str = raw_reply.split("```")[1].split("```")[0].strip()
                else:
                    json_str = raw_reply.strip()
                return json.loads(json_str)
            else:
                print(f"     API error {res.status_code}: {res.text[:150]}")
                time.sleep(3)
        except Exception as e:
            print(f"     Exception: {e}")
            time.sleep(3)
    return None

def process_level(level_id, pdf_path, units_config, level_title, level_desc):
    out_dir = "data/client_curriculum"
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, f"level_{level_id.lower()}_modules.json")

    print(f"\n==========================================")
    print(f"Processing Level {level_id}: {level_title}")
    print(f"PDF Source: {pdf_path}")
    print(f"==========================================")

    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} does not exist.")
        return

    doc = fitz.open(pdf_path)
    modules = []

    # Check if individual files already exist to avoid re-extracting
    for u in units_config:
        unit_num = u["num"]
        mod_cache_file = os.path.join(out_dir, f"{level_id}-M{unit_num:02d}.json")
        if os.path.exists(mod_cache_file):
            print(f"Found cached unit: {mod_cache_file}")
            with open(mod_cache_file, "r", encoding="utf-8") as f:
                modules.append(json.load(f))
            continue

        mod_data = extract_single_unit(doc, u, level_id)
        if mod_data:
            with open(mod_cache_file, "w", encoding="utf-8") as f:
                json.dump(mod_data, f, indent=2, ensure_ascii=False)
            modules.append(mod_data)
            print(f"  ✓ {level_id}-M{unit_num:02d} extracted & cached.")
        else:
            print(f"  ✗ FAILED to extract {level_id}-M{unit_num:02d}.")

        time.sleep(1) # respectful rate limiting
 
    for m in modules:
        if m.get("orderIndex") == 12:
            m["isExam"] = True

    CEFR_ORDER_INDEX = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}

    result_level = {
        "level": {
            "id": level_id,
            "cefr": level_id,
            "title": level_title,
            "description": level_desc,
            "orderIndex": CEFR_ORDER_INDEX.get(level_id, 1)
        },
        "modules": modules
    }

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(result_level, f, indent=2, ensure_ascii=False)

    print(f"\nSUCCESS: Level {level_id} complete ({len(modules)} units) -> {out_file}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "A1"
    target_up = target.upper()

    if target_up == "A1":
        process_level(
            level_id="A1",
            pdf_path="pdf_raw/LEVEL SMP-SMA (Think Starter - Think 5)/think Starter.pdf",
            units_config=THINK_STARTER_UNITS,
            level_title="A1 - Beginner English",
            level_desc="Fondasi tata bahasa dasar, kosakata kehidupan sehari-hari, dan percakapan esensial."
        )
    elif target_up == "A2":
        process_level(
            level_id="A2",
            pdf_path="pdf_raw/LEVEL SMP-SMA (Think Starter - Think 5)/think 1 sb 1ed.pdf",
            units_config=THINK_1_UNITS,
            level_title="A2 - Elementary English",
            level_desc="Pengembangan percakapan aktif, past tenses, perbandingan, dan aktivitas kontekstual."
        )
    elif target_up == "B1":
        process_level(
            level_id="B1",
            pdf_path="pdf_raw/LEVEL SMP-SMA (Think Starter - Think 5)/think_2_students_book.pdf",
            units_config=THINK_2_UNITS,
            level_title="B1 - Pre-Intermediate English",
            level_desc="Peningkatan kefasihan berbicara, modal verbs, present perfect mendalam, dan conditional sentences."
        )
    elif target_up == "B2":
        process_level(
            level_id="B2",
            pdf_path="pdf_raw/LEVEL SMP-SMA (Think Starter - Think 5)/think 3 sb 1ed.pdf",
            units_config=THINK_3_UNITS,
            level_title="B2 - Intermediate English",
            level_desc="Penguasaan passive voice, reported speech, third conditional, dan percakapan argumentatif kompleks."
        )
    elif target_up == "C1":
        process_level(
            level_id="C1",
            pdf_path="pdf_raw/LEVEL SMP-SMA (Think Starter - Think 5)/Think 4 students book.pdf",
            units_config=THINK_4_UNITS,
            level_title="C1 - Upper Intermediate English",
            level_desc="Struktur kalimat kompleks, inversion, mixed conditionals, dan penguasaan idiomatis tinggi."
        )
    elif target_up == "C2":
        process_level(
            level_id="C2",
            pdf_path="pdf_raw/Think 5 second editon cambridge (1).pdf",
            units_config=THINK_5_UNITS,
            level_title="C2 - Advanced & Proficiency English",
            level_desc="Kemahiran retorika tingkat ahli, nuansa linguistik mendalam, dan penguasaan akademik setara penutur asli."
        )
