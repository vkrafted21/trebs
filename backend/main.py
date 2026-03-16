import os
import faiss
import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans

from database import questions_collection

app = FastAPI()

EMBEDDINGS_FILE = "embeddings.npy"
FAISS_FILE = "faiss_index.bin"

# -----------------------------
# LOAD SBERT MODEL
# -----------------------------

model = SentenceTransformer("all-MiniLM-L6-v2")

# -----------------------------
# LOAD QUESTIONS FROM MONGODB
# -----------------------------

questions_data = list(questions_collection.find())

df = pd.DataFrame(questions_data)

questions = df["question"].tolist()

# -----------------------------
# LOAD OR CREATE EMBEDDINGS
# -----------------------------

if os.path.exists(EMBEDDINGS_FILE):

    embeddings = np.load(EMBEDDINGS_FILE)

else:

    embeddings = model.encode(questions)

    embeddings = np.array(embeddings).astype("float32")

    faiss.normalize_L2(embeddings)

    np.save(EMBEDDINGS_FILE, embeddings)

embeddings = embeddings.astype("float32")

faiss.normalize_L2(embeddings)

# -----------------------------
# LOAD OR CREATE FAISS INDEX
# -----------------------------

dimension = embeddings.shape[1]

if os.path.exists(FAISS_FILE):

    index = faiss.read_index(FAISS_FILE)

else:

    base_index = faiss.IndexFlatIP(dimension)

    index = faiss.IndexIDMap(base_index)

    vector_ids = df["vector_id"].to_numpy()

    index.add_with_ids(embeddings, vector_ids)

    faiss.write_index(index, FAISS_FILE)

# -----------------------------
# CLUSTER QUESTIONS
# -----------------------------

kmeans = KMeans(n_clusters=5, random_state=42)

df["cluster"] = kmeans.fit_predict(embeddings)

# -----------------------------
# REQUEST MODELS
# -----------------------------

class Query(BaseModel):
    question: str


class NewQuestion(BaseModel):
    question: str
    year: int
    part: str
    bl: int


# -----------------------------
# HOME ROUTE
# -----------------------------

@app.get("/")
def home():
    return {"message": "Question Similarity API Running"}


# -----------------------------
# SIMILARITY SEARCH
# -----------------------------

@app.post("/similar")
def find_similar(query: Query):

    query_embedding = model.encode([query.question]).astype("float32")

    faiss.normalize_L2(query_embedding)

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
        "frequency": len(results)
    }


# -----------------------------
# ADD NEW QUESTION
# -----------------------------

@app.post("/add-question")
def add_question(data: NewQuestion):

    global embeddings, index

    vector_id = index.ntotal

    # insert into MongoDB
    questions_collection.insert_one({
        "question": data.question,
        "year": data.year,
        "part": data.part,
        "bl": data.bl,
        "vector_id": vector_id
    })

    embedding = model.encode([data.question]).astype("float32")

    faiss.normalize_L2(embedding)

    embeddings = np.vstack([embeddings, embedding])

    np.save(EMBEDDINGS_FILE, embeddings)

    index.add_with_ids(embedding, np.array([vector_id]))

    faiss.write_index(index, FAISS_FILE)

    return {
        "message": "Question added",
        "vector_id": int(vector_id)
    }