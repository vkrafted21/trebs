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

    pdf_bytes = await file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    text = ""
    for page in doc:
        text += page.get_text() + "\n"

    lines = [line.strip() for line in text.split("\n") if line.strip()]

    part_a = []
    part_b = {}

    inside_part_a = False
    inside_part_b = False
    current_unit = None

    for line in lines:

        # detect sections
        if line == "PART-A":
            inside_part_a = True
            inside_part_b = False
            continue

        if line == "PART-B":
            inside_part_a = False
            inside_part_b = True
            continue

        # ---------------- PART A ----------------
        if inside_part_a:

            if re.match(r'^[a-e]\)', line.lower()):

                q = re.sub(r'^[a-e]\)\s*', '', line).strip()

                matches = search_questions(index, q)

                part_a.append({
                    "question": q,
                    "matches": matches
                })

        # ---------------- PART B ----------------
        elif inside_part_b:

            # detect unit
            if re.match(r'^UNIT-[IVX]+$', line):
                current_unit = line
                part_b[current_unit] = []
                continue

            # skip OR completely
            if line.upper() == "OR":
                continue

            if current_unit:

                # numbered questions
                if re.match(r'^\d+\.', line):

                    q = re.sub(r'^\d+\.\s*', '', line).strip()

                    matches = search_questions(index, q)

                    part_b[current_unit].append({
                        "question": q,
                        "matches": matches
                    })

                # subquestions a) b)
                elif re.match(r'^[ab]\)', line.lower()):

                    q = re.sub(r'^[ab]\)\s*', '', line).strip()

                    matches = search_questions(index, q)

                    part_b[current_unit].append({
                        "question": q,
                        "matches": matches
                    })

    total_questions = len(part_a)

    for unit in part_b:
        total_questions += len(part_b[unit])

    return {
        "total_questions": total_questions,
        "part_a": part_a,
        "part_b": part_b
    }
