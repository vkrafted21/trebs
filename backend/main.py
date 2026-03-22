from fastapi import FastAPI
from database import questions_collection
from models.schemas import Query, NewQuestion

from services.embedding_service import load_or_create_embeddings
from services.faiss_service import load_or_create_index
from services.question_service import search_questions, add_question

from utils.memory import get_memory_usage

app = FastAPI()

# load data
questions_data = list(questions_collection.find())

questions = [q["question"] for q in questions_data]
vector_ids = [q["vector_id"] for q in questions_data]

# load embeddings
embeddings = load_or_create_embeddings(questions)

# load faiss index
index = load_or_create_index(embeddings, vector_ids)


@app.get("/")
def home():
    return {"message": "api running"}


@app.post("/similar")
def find_similar(query: Query):
    results = search_questions(index, query.question)

    return {
        "query": query.question,
        "results": results,
        "ram_usage_mb": get_memory_usage()
    }


@app.post("/add-question")
def add_new_question(data: NewQuestion):
    global embeddings

    vector_id, embeddings = add_question(index, embeddings, data)

    return {
        "message": "question added successfully",
        "vector_id": vector_id
    }