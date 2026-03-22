from pydantic import BaseModel

class QueryRequest(BaseModel):
    question: str

class NewQuestionRequest(BaseModel):
    question: str
    year: int
    part: str
    bl: int