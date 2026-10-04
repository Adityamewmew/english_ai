import os
import json
import re
import pypdf

PDF_BASE = r"c:\project\english-ai\pdf_raw"
OUTPUT_FILE = r"c:\project\english-ai\data\curriculum_knowledge_brain.json"

def extract_pages_text(file_path, start_page, end_page):
    if not os.path.exists(file_path):
        return ""
    try:
        reader = pypdf.PdfReader(file_path)
        total = len(reader.pages)
        end = min(end_page, total)
        texts = []
        for p in range(start_page - 1, end):
            t = reader.pages[p].extract_text() or ""
            texts.append(t)
        return "\n".join(texts)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return ""

def clean_text(text):
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    return text.strip()

def build_knowledge_brain():
    print("[PDF Brain Extractor] Reading official Cambridge & Exam textbooks...")
    brain = {
        "metadata": {
            "sourceDirectory": PDF_BASE,
            "extractedAt": "2026-10-04",
            "version": "1.0.0",
            "description": "Otak AI Kurikulum terpadu dari buku Think Cambridge (Starter - 5), Complete IELTS, TOEFL & TOEIC"
        },
        "levels": {}
    }

    # 1. Level B1 (Think 3 & TOEIC)
    print("-> Extracting Level B1 (Think 3 & TOEIC Starter)...")
    think3_path = os.path.join(PDF_BASE, r"LEVEL SMP-SMA (Think Starter - Think 5)\think 3 sb 1ed.pdf")
    toeic_path = os.path.join(PDF_BASE, r"TOEIC HAND OUT\Starter_TOEIC_3rd_Edition.pdf")
    
    think3_contents = extract_pages_text(think3_path, 4, 7)
    toeic_contents = extract_pages_text(toeic_path, 4, 10)

    brain["levels"]["B1"] = {
        "sourceBooks": ["Cambridge Think 3 (B1 Threshold)", "Compass Starter TOEIC 3rd Edition"],
        "syllabusContents": clean_text(think3_contents)[:4000],
        "businessPracticalSyllabus": clean_text(toeic_contents)[:4000],
        "targetSublevels": {
            "B1.4": "Workplace Communication, Service Engagements & Intermediate Practical Grammar",
            "B1.5": "Social Debates, Media Literacy & Pre-B2 Fluency Consolidation"
        }
    }

    # 2. Level B2 (Think 4 & TOEFL)
    print("-> Extracting Level B2 (Think 4 & TOEFL Update)...")
    think4_path = os.path.join(PDF_BASE, r"LEVEL SMP-SMA (Think Starter - Think 5)\Think 4 students book.pdf")
    toefl_path = os.path.join(PDF_BASE, r"TOEFL HAND OUT\TOEFL HAND OUT Eddy's English UPDATE 2026.pdf")

    think4_contents = extract_pages_text(think4_path, 4, 7)
    toefl_contents = extract_pages_text(toefl_path, 2, 8)

    brain["levels"]["B2"] = {
        "sourceBooks": ["Cambridge Think 4 (B2 Vantage)", "Eddy's English TOEFL Master Handout 2026"],
        "syllabusContents": clean_text(think4_contents)[:4000],
        "academicGrammarSyllabus": clean_text(toefl_contents)[:4000],
        "targetSublevels": {
            "B2.4": "Academic Argumentation, Cause & Effect Synthesis & TOEFL Structure",
            "B2.5": "Nuanced Persuasion, Mixed Conditionals & Upper-Intermediate Proficiency"
        }
    }

    # 3. Level C1 (Think 5 & Complete IELTS 6.5-7.5)
    print("-> Extracting Level C1 (Think 5 & Complete IELTS)...")
    think5_path = os.path.join(PDF_BASE, r"LEVEL SMP-SMA (Think Starter - Think 5)\Think 5 eddys.pdf")
    ielts_path = os.path.join(PDF_BASE, r"IELTS HAND OUT\Complete_IELTS._Bands_6.5-7.5_Students_book_(CUP)_(z-library.sk_1lib.sk_z-lib.sk).pdf")

    think5_contents = extract_pages_text(think5_path, 4, 7)
    ielts_contents = extract_pages_text(ielts_path, 4, 8)

    brain["levels"]["C1"] = {
        "sourceBooks": ["Cambridge Think 5 (C1 Effective Operational Proficiency)", "Cambridge Complete IELTS Bands 6.5-7.5"],
        "syllabusContents": clean_text(think5_contents)[:4000],
        "ieltsAcademicSyllabus": clean_text(ielts_contents)[:4000],
        "targetSublevels": {
            "C1.4": "Complex Inversion, Formulaic Concession & Rhetorical Devices",
            "C1.5": "Academic Peer Review, Empirical Research Critiques & Hedging",
            "C1.6": "Diplomatic Negotiation, Tactical Concession & Executive Discourse",
            "C1.7": "High-Stakes Crisis Communication & Advanced Dialectical Synthesis"
        }
    }

    # 4. Level C2 (IELTS Mastery & Cambridge C2)
    print("-> Extracting Level C2 (IELTS Mastery & Academic 16)...")
    ielts_mastery_path = os.path.join(PDF_BASE, r"IELTS HAND OUT\IELTS_Mastery_Guidebook.pdf")
    ielts_16_path = os.path.join(PDF_BASE, r"IELTS HAND OUT\IELTS SIMULATION TEST 1\IELTS_16_Academic_Students_Book_with_Answers_16_(2021_Cambridge)_-_libgen.li.pdf")

    ielts_mastery_text = extract_pages_text(ielts_mastery_path, 1, 8)
    ielts_16_text = extract_pages_text(ielts_16_path, 2, 7)

    brain["levels"]["C2"] = {
        "sourceBooks": ["Cambridge IELTS Academic 16", "Eddy's IELTS Mastery Guidebook"],
        "masterySyllabus": clean_text(ielts_mastery_text)[:4000],
        "academicProficiencySyllabus": clean_text(ielts_16_text)[:4000],
        "targetSublevels": {
            "C2.4": "Forensic Linguistics, Semantic Disambiguation & Syntactic Artistry",
            "C2.5": "Grandmaster Dialectics, Epigrammatic Wit & Subtle Satire",
            "C2.6": "Hermeneutic Analysis of Historic Treatises & Philosophical Debate",
            "C2.7": "The Sovereign English Speaker: Effortless Native Artistry & Capstone Mastery"
        }
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(brain, f, indent=2, ensure_ascii=False)

    print(f"\n[SUCCESS] Otak AI Kurikulum berhasil dibuat dan disimpan di: {OUTPUT_FILE}")
    print(f"Total Level Terkoneksi: {len(brain['levels'])} levels (B1, B2, C1, C2)")

if __name__ == "__main__":
    build_knowledge_brain()
