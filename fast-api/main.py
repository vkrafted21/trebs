from fastapi import FastAPI
from database import questions_collection
from models.request_models import QueryRequest, NewQuestionRequest

from services.embedding_service import load_or_create_embeddings
from services.faiss_service import load_or_create_index
from services.question_service import search_questions, add_question
from fastapi import UploadFile, File
import fitz   # pymupdf
import re

app = FastAPI()

# load data
questions_data = list(questions_collection.find())

# IMPORTANT: only unique questions for embeddings
unique_questions = {}
for q in questions_data:
    if q["question"] not in unique_questions:
        unique_questions[q["question"]] = q["vector_id"]

questions = list(unique_questions.keys())
vector_ids = list(unique_questions.values())

# load embeddings
embeddings = load_or_create_embeddings(questions)

# load faiss index
index = load_or_create_index(embeddings, vector_ids)


@app.get("/")
def home():
    return {"message": "api running"}


@app.post("/similar")
def find_similar(query: QueryRequest):
    results = search_questions(index, query.question)

    return {
        "query": query.question,
        "results": results,
    }


@app.post("/add-question")
def add_new_question(data: NewQuestionRequest):
    global embeddings

    vector_id, embeddings = add_question(index, embeddings, data)

    return {
        "message": "question added successfully",
        "vector_id": vector_id
    }
    
@app.post("/analyze-paper")
async def analyze_paper(file: UploadFile = File(...)):

    import re
    import fitz

    # ---------- READ PDF ----------
    pdf_bytes = await file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    text = ""

    for page in doc:
        text += page.get_text() + "\n"

    lines = [line.strip() for line in text.split("\n") if line.strip()]

    # ---------- OUTPUT ----------
    part_a = []
    part_b = {}

    inside_part_a = False
    inside_part_b = False
    current_unit = None

    # ---------- CLEAN QUESTION ----------
    def clean_question(q):
        q = q.replace("\u200b", "")            
        q = re.sub(r'^\d+\.\s*', '', q)       
        q = re.sub(r'^[a-e]\)\s*', '', q)      
        return q.strip()

    # ---------- GET SIMILARITY ----------
    def get_matches(q):
        results = search_questions(index, q)

        filtered = [
            r for r in results
            if r["similarity"] >= 0.50
        ][:3]

        if not filtered:
            return [
                {
                    "message": "New Question"
                }
            ]

        return filtered

    # ---------- PARSER ----------
    for line in lines:

        # detect sections
        if line.upper() == "PART-A":
            inside_part_a = True
            inside_part_b = False
            continue

        if line.upper() == "PART-B":
            inside_part_a = False
            inside_part_b = True
            continue

        # ================= PART A =================
        if inside_part_a:

            if re.match(r'^[a-e]\)', line.lower()):

                q = clean_question(line)

                part_a.append({
                    "question": q,
                    "matches": get_matches(q)
                })

        # ================= PART B =================
        elif inside_part_b:

            # detect UNIT
            if re.match(r'^UNIT-[IVX]+$', line.upper()):
                current_unit = line.upper()
                part_b[current_unit] = []
                continue

            # skip OR
            if line.upper() == "OR":
                continue

            if current_unit:

                # numbered questions
                if re.match(r'^\d+\.', line):

                    q = clean_question(line)

                    if q:
                        part_b[current_unit].append({
                            "question": q,
                            "matches": get_matches(q)
                        })

                # subquestions
                elif re.match(r'^[ab]\)', line.lower()):

                    q = clean_question(line)

                    if q:
                        part_b[current_unit].append({
                            "question": q,
                            "matches": get_matches(q)
                        })

    # ---------- TOTAL ----------
    total_questions = len(part_a)

    for unit in part_b:
        total_questions += len(part_b[unit])

    # ---------- RESPONSE ----------
    return {
        "total_questions": total_questions,
        "part_a": part_a,
        "part_b": part_b
    }
    
@app.get("/analytics")
def get_analytics():

    from collections import defaultdict

    # -----------------------------------
    # FETCH ALL QUESTIONS FROM MONGODB
    # -----------------------------------
    data = list(questions_collection.find())

    # -----------------------------------
    # COUNTERS
    # -----------------------------------
    bl_counts = defaultdict(int)
    year_bl = defaultdict(lambda: defaultdict(int))
    part_bl = defaultdict(lambda: defaultdict(int))
    year_avg = defaultdict(list)
    question_repeat = defaultdict(int)

    # -----------------------------------
    # PROCESS DATA
    # -----------------------------------
    for row in data:

        question = row.get("question", "").strip()
        year = row.get("year")
        part = row.get("part")
        bl = row.get("bl")

        if not year or not bl:
            continue

        # overall BL count
        bl_counts[f"BL{bl}"] += 1

        # year wise BL
        year_bl[str(year)][f"BL{bl}"] += 1

        # part wise BL
        if part:
            part_bl[part][f"BL{bl}"] += 1

        # avg difficulty
        year_avg[str(year)].append(bl)

        # repeated questions
        if question:
            question_repeat[question] += 1

    # -----------------------------------
    # 1. BL DISTRIBUTION
    # -----------------------------------
    bl_distribution = [
        {"name": key, "value": value}
        for key, value in sorted(bl_counts.items())
    ]

    # -----------------------------------
    # 2. BL TREND BY YEAR
    # -----------------------------------
    bl_trend_by_year = []

    for year in sorted(year_bl.keys()):

        row = {"year": year}

        for bl in range(1, 7):
            row[f"BL{bl}"] = year_bl[year].get(f"BL{bl}", 0)

        bl_trend_by_year.append(row)

    # -----------------------------------
    # 3. AVG DIFFICULTY BY YEAR
    # -----------------------------------
    avg_difficulty = []

    for year in sorted(year_avg.keys()):

        values = year_avg[year]

        avg_difficulty.append({
            "year": year,
            "score": round(sum(values) / len(values), 2)
        })

    # -----------------------------------
    # 4. PARTWISE BL
    # -----------------------------------
    partwise_bl = []

    for part in sorted(part_bl.keys()):

        row = {"part": part}

        for bl in range(1, 7):
            row[f"BL{bl}"] = part_bl[part].get(f"BL{bl}", 0)

        partwise_bl.append(row)

    # -----------------------------------
    # 5. MOST REPEATED QUESTIONS
    # -----------------------------------
    most_repeated_questions = sorted(
        [
            {"question": q, "count": c}
            for q, c in question_repeat.items()
        ],
        key=lambda x: x["count"],
        reverse=True
    )[:10]

    # -----------------------------------
    # RESPONSE
    # -----------------------------------
    return {
        "total_questions": len(data),

        "charts": {
            "bl_distribution": bl_distribution,
            "bl_trend_by_year": bl_trend_by_year,
            "avg_difficulty": avg_difficulty,
            "partwise_bl": partwise_bl,
            "most_repeated_questions": most_repeated_questions
        }
    }