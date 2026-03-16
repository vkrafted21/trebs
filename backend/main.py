from fastapi import FastAPI
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans

app = FastAPI()

# Load dataset
df = pd.read_csv("questions.txt")

# Load SBERT model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Generate embeddings
questions = df["question"].tolist()
embeddings = model.encode(questions)

# Cluster questions
kmeans = KMeans(n_clusters=5, random_state=42)
clusters = kmeans.fit_predict(embeddings)

df["cluster"] = clusters

from pydantic import BaseModel
from sentence_transformers import util

class Query(BaseModel):
    question: str

@app.post("/similar")
def find_similar(query: Query):

    query_embedding = model.encode(query.question)

    scores = util.cos_sim(query_embedding, embeddings)[0]

    threshold = 0.7

    results = []

    for i, score in enumerate(scores):
        if score >= threshold:
            results.append({
                "question": df.iloc[i]["question"],
                "year": int(df.iloc[i]["year"]),
                "cluster": int(df.iloc[i]["cluster"]),
                "similarity": float(score)
            })

    return {
        "query": query.question,
        "frequency": len(results),
        "results": results
    }