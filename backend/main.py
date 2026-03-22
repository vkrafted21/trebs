from fastapi import FastAPI
from database import questions_collection
from models.request_models import QueryRequest, NewQuestionRequest

from services.embedding_service import load_or_create_embeddings
from services.faiss_service import load_or_create_index
from services.question_service import search_questions, add_question

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