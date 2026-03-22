from pydantic import BaseModel

class Query(BaseModel):
    question: str

class NewQuestion(BaseModel):
    question: str
    year: int
    part: str
    bl: int