import os
import faiss
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

from database import questions_collection

app = FastAPI()

EMBEDDINGS_FILE = "embeddings.npy"
FAISS_FILE = "faiss_index.bin"

model = SentenceTransformer("all-MiniLM-L6-v2")


# LOAD QUESTIONS
questions_data = list(questions_collection.find())
questions = [q["question"] for q in questions_data]
vector_ids = [q["vector_id"] for q in questions_data]

# LOAD OR CREATE EMBEDDINGS
if os.path.exists(EMBEDDINGS_FILE):
    embeddings = np.load(EMBEDDINGS_FILE).astype("float32")
else:
    embeddings = model.encode(
        questions,
        normalize_embeddings=True
    ).astype("float32")

    np.save(EMBEDDINGS_FILE, embeddings)

# LOAD OR CREATE FAISS INDEX
dimension = embeddings.shape[1]

if os.path.exists(FAISS_FILE):
    index = faiss.read_index(FAISS_FILE)
else:
    base_index = faiss.IndexFlatIP(dimension)
    index = faiss.IndexIDMap(base_index)

    index.add_with_ids(
        embeddings,
        np.array(vector_ids).astype("int64")
    )

    faiss.write_index(index, FAISS_FILE)

# REQUEST MODELS
class Query(BaseModel):
    question: str


class NewQuestion(BaseModel):
    question: str
    year: int
    part: str
    bl: int


# HOME ROUTE
@app.get("/")
def home():
    return {
        "message": "API Running",
    }


#  SIMILARITY SEARCH
@app.post("/similar")
def find_similar(query: Query):

    query_embedding = model.encode(
        [query.question],
        normalize_embeddings=True
    ).astype("float32")

    k = 5
    scores, ids = index.search(query_embedding, k)

    results = []

    for i, vector_id in enumerate(ids[0]):

        doc = questions_collection.find_one({
            "vector_id": int(vector_id)
        })

        if doc:
            results.append({
                "question": doc["question"],
                "year": doc["year"],
                "part": doc.get("part"),
                "bl": doc["bl"],
                "similarity": float(scores[0][i])
            })

    return {
        "query": query.question,
        "results": results,
    }


# ADD NEW QUESTION
@app.post("/add-question")
def add_question(data: NewQuestion):

    global embeddings, index

    vector_id = int(index.ntotal)

    # insert into MongoDB
    questions_collection.insert_one({
        "question": data.question,
        "year": data.year,
        "part": data.part,
        "bl": data.bl,
        "vector_id": vector_id
    })

    embedding = model.encode(
        [data.question],
        normalize_embeddings=True
    ).astype("float32")

    # update embeddings
    embeddings = np.vstack([embeddings, embedding])
    np.save(EMBEDDINGS_FILE, embeddings)

    # update FAISS
    index.add_with_ids(
        embedding,
        np.array([vector_id]).astype("int64")
    )

    faiss.write_index(index, FAISS_FILE)

    return {
        "message": "Question added successfully",
        "vector_id": vector_id,
    }