# 1. Cargar la bd con langchain
from langchain.sql_database import SQLDatabase
from langchain.chat_models import ChatOpenAI
from langchain.agents import create_sql_agent
from langchain.agents.agent_toolkits import SQLDatabaseToolkit
from langchain.agents.agent_types import AgentType
import ApiGPT
import os

# 2. Cargar la clave de openAI
os.environ["OPENAI_API_KEY"] = ApiGPT.OPENAI_API_KEY

# 3. Conectar con la BD
user = "postgres"
password = "1123860023Stocken"
host = "localhost"
port = "5432"
database = "Prueba"

uri = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"
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

def consulta(input_usuario):
    consulta = formato.format(question = input_usuario)
    resultado = agent_executor.run(consulta)
    return resultado