import numpy as np
from database import questions_collection
from services.embedding_service import encode_query
from services.faiss_service import add_to_index

def search_questions(index, query):
    query_embedding = encode_query(query)

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

    return results

def add_question(index, embeddings, data):
    vector_id = int(index.ntotal)

    questions_collection.insert_one({
        "question": data.question,
        "year": data.year,
        "part": data.part,
        "bl": data.bl,
        "vector_id": vector_id
    })

    from services.embedding_service import encode_query

    embedding = encode_query(data.question)

    embeddings = np.vstack([embeddings, embedding])

    np.save("embeddings.npy", embeddings)

    add_to_index(index, embedding, vector_id)

    return vector_id, embeddings