import os
import faiss
import numpy as np

FAISS_FILE = "faiss_index.bin"

def load_or_create_index(embeddings, vector_ids):
    dimension = embeddings.shape[1]

    if os.path.exists(FAISS_FILE):
        return faiss.read_index(FAISS_FILE)

    base_index = faiss.IndexFlatIP(dimension)
    index = faiss.IndexIDMap(base_index)

    index.add_with_ids(
        embeddings,
        np.array(vector_ids).astype("int64")
    )

    faiss.write_index(index, FAISS_FILE)

    return index

def add_to_index(index, embedding, vector_id):
    index.add_with_ids(
        embedding,
        np.array([vector_id]).astype("int64")
    )

    faiss.write_index(index, FAISS_FILE)