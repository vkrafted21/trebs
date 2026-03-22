from database import questions_collection

docs = list(questions_collection.find())

for i, doc in enumerate(docs):

    questions_collection.update_one(
        {"_id": doc["_id"]},
        {"$set": {"vector_id": i}}
    )

print("vector_id added to all documents")