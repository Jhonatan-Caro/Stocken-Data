from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from chatBot import consultar_db

app = FastAPI()

class Pregunta(BaseModel):
    question: str

@app.post("/chat")
async def chat(pregunta: Pregunta):
    try:
        respuesta = consultar_db(pregunta.question)
        return {"respuesta": respuesta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Bienvenido al chatbot de la base de datos. Envía una pregunta a /chat."}