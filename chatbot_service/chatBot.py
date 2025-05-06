# 1. Cargar la bd con langchain
from langchain_community.utilities import SQLDatabase
from langchain_openai import ChatOpenAI
from langchain_community.agent_toolkits.sql.base import create_sql_agent
from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit
from langchain.agents import AgentType
from dotenv import load_dotenv
import os

#Cargar variables de entorno
load_dotenv()

# 2. Cargar la clave de openAI
openai_key = os.getenv("OPENAI_API_KEY")
os.environ["OPENAI_API_KEY"] = openai_key

# 3. Conectar con la BD
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
database = os.getenv("DB_NAME")

uri = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"
print(f"URI: {uri.encode('utf-8')}")
db = SQLDatabase.from_uri(uri)

# 4. Crear el modelo de lenguaje
llm = ChatOpenAI(temperature=0,model_name='gpt-3.5-turbo')

# 5. Crear el toolkit para usar con agentes
toolkit = SQLDatabaseToolkit(llm=llm, db=db)

# 6. Crear el agente capaz de interactuar con SQL
agent_executor = create_sql_agent(
    llm=llm,
    toolkit=toolkit,
    agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

formato = """
Dada una pregunta del usuario:
1. Crea una consulta de sqlite
2. revisa los resultados
3. devuelve el dato
4. si tienes que hacer alguna aclaracion o devolver cualquier texto que sea en español
#{question}
"""

def consultar_db(pregunta: str) -> str:
    consulta = formato.format(question = pregunta)
    resultado = agent_executor.run(consulta)
    return resultado