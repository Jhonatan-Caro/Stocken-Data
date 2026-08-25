from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from api.agent.service import consult_db
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas las origines
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos HTTP
    allow_headers=["*"],  # Permitir todos los headers
)

class Question(BaseModel):
    ask: str
    user_id: int

@app.post("/chat")
async def chat(question: Question):
    try:
        response = consult_db(question.ask, question.user_id)
        return {"respuesta": response}
    except Exception as e:
        print(f"Error al procesar la pregunta: {e}")
        raise HTTPException(status_code=500, detail=str(e))