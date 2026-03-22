import numpy as np
import os
from database import questions_collection
from services.embedding_service import encode_query
from services.faiss_service import add_to_index


def search_questions(index, query):
    query_embedding = encode_query(query)

    k = 5
    scores, ids = index.search(query_embedding, k)

    results = []

    for i, vector_id in enumerate(ids[0]):
        if vector_id == -1:
            continue

        docs = questions_collection.find({
            "vector_id": int(vector_id)
        })

        for doc in docs:
            results.append({
                "question": doc["question"],
                "year": doc["year"],
                "part": doc.get("part"),
                "bl": doc["bl"],
                "similarity": float(scores[0][i])
            })

    return results


def add_question(index, embeddings, data):
    # check if question already exists (same text)
    existing = questions_collection.find_one({"question": data.question})

    if existing:
        vector_id = existing["vector_id"]

        questions_collection.insert_one({
            "question": data.question,
            "year": data.year,
            "part": data.part,
            "bl": data.bl,
            "vector_id": vector_id
        })

        return vector_id, embeddings

    # new unique question → new vector
    vector_id = questions_collection.count_documents({})

    questions_collection.insert_one({
        "question": data.question,
        "year": data.year,
        "part": data.part,
        "bl": data.bl,
        "vector_id": vector_id
    })

    # generate embedding
    embedding = encode_query(data.question)

    embeddings = np.vstack([embeddings, embedding])

    # safe save
    np.save("embeddings_temp.npy", embeddings)
    os.replace("embeddings_temp.npy", "embeddings.npy")

    # add to faiss
    add_to_index(index, embedding, vector_id)

    return vector_id, embeddings