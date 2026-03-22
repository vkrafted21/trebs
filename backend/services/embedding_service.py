import os
import numpy as np
from sentence_transformers import SentenceTransformer

EMBEDDINGS_FILE = "embeddings.npy"

model = SentenceTransformer("all-MiniLM-L6-v2")

def load_or_create_embeddings(questions):
    if os.path.exists(EMBEDDINGS_FILE):
        embeddings = np.load(EMBEDDINGS_FILE).astype("float32")
    else:
        embeddings = model.encode(
            questions,
            normalize_embeddings=True
        ).astype("float32")

        np.save(EMBEDDINGS_FILE, embeddings)

    return embeddings

def encode_query(text):
    return model.encode(
        [text],
        normalize_embeddings=True
    ).astype("float32")