from langchain_openai import ChatOpenAI
from api.config import Config

openai_key = Config.OPENAI_API_KEY
if not openai_key:
    raise RuntimeError(
        "La variable de entorno OPENAI_API_KEY no está definida. "
        "Configúrala en el archivo .env antes de iniciar el servicio."
    )

def build_llm():
    return ChatOpenAI(temperature=0, model_name='gpt-4')