from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from chatBot import consultar_db
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas las origines
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos HTTP
    allow_headers=["*"],  # Permitir todos los headers
)

class Pregunta(BaseModel):
    question: str
    usuario_id: int

@app.post("/chat")
async def chat(pregunta: Pregunta):
    try:
        respuesta = consultar_db(pregunta.question, pregunta.usuario_id)
        return {"respuesta": respuesta}
    except Exception as e:
        print(f"Error al procesar la pregunta: {e}")
        raise HTTPException(status_code=500, detail=str(e))