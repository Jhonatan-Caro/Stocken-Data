# 1. Cargar la bd con langchain
from langchain_community.utilities import SQLDatabase
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, MessagesPlaceholder, PromptTemplate
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_community.agent_toolkits.sql.base import create_sql_agent
from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit
from langchain.tools import Tool
from dotenv import load_dotenv
#from toolsCategorias import crear_categoria, obtener_categorias
#from toolsRegistros import agregar_registro, eliminar_registro, editar_registro
#from toolsProducto import obtener_productos, agregar_producto, editar_producto, eliminar_producto
from toolsProducto import crear_producto, editar_producto, eliminar_producto, listar_productos
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
db = SQLDatabase.from_uri(uri, engine_args={"pool_pre_ping": True})

# 4. Crear el modelo de lenguaje
llm = ChatOpenAI(temperature=0,model_name='gpt-4')

# 5. Crear el toolkit para usar con agentes
toolkit = SQLDatabaseToolkit(llm=llm, db=db)
sql_tools = toolkit.get_tools()

tools = sql_tools + [
    crear_producto,
    editar_producto,
    eliminar_producto,
]

system_template = """
    Eres un asistente experto en gestión de base de datos para productos y categorías.

    Reglas generales:
    1. Solo puedes usar las herramientas disponibles.
    2. Siempre responde en español.
    3. Si la pregunta requiere acción, como agregar o editar, responde si fue exitosa o no.
    4. Cuando muestres productos o registros, usa el siguiente formato:
    - Nombre: ___, Cantidad: ___, Precio: ___
    5. Si no hay resultados, responde: No hay información disponible.
    6. Siempre filtra las consultas por el usuario_id correspondiente.
    7. Usa un tono claro y amigable.
    8. Para llamar a crear_producto debes pasar un objeto con las propiedades usuario_id (int), nombre (str), precio (float), stock (int) y caracteristicas (objeto JSON). Pasa un diccionario JSON válido, no una cadena JSON en formato texto.

    Instrucciones específicas para consultas SQL:

    1. SIEMPRE incluye `usuario_id = {usuario_id}` en cualquier consulta SQL.
    2. Usa JOINs solo cuando sea necesario unir registros con sus categorías.
    3. La tabla `registros_dinamicos` contiene la columna `datos` en formato JSONB.
    - Las claves están en minúsculas. Ejemplo: 'nombre', 'cantidad', 'precio'.
    - Para acceder a una clave: datos->>'nombre'
    4. Para unir registros con categorías, haz: JOIN categorias_dinamicas c ON registros_dinamicos.categoria_id = c.id
    5. Usa también `c.nombre = 'Frutas'` o lo que corresponda si el usuario menciona una categoría.
    6. Muestra resultados de forma natural, en listas como:
    - Nombre: ___, Tamaño: ___, Cantidad: ___
    7. Si no se encuentran datos, responde:
    Final Answer: No hay resultados para tu consulta.
    8. NO inventes respuestas ni rellenes huecos. Solo responde lo que existe en la base de datos.
    9. Siempre responde en español y con lenguaje sencillo.
    10. Si el usuario pregunta por una propiedad como 'cantidad', 'stock' o 'precio', asegúrate de incluir también `datos->>'nombre'` para identificar a qué producto pertenece ese dato.
    Ejemplo:
    - Nombre: Uvas, Cantidad: 10

    Ejemplo:
    Pregunta: ¿Qué frutas tengo?
    Respuesta:
    Final Answer:
    - Nombre: Manzana, Tamaño: pequeñas, Cantidad: 20
    - Nombre: Uvas, Tamaño: medianas, Cantidad: 10

    11. Si no encuentras la clave JSON 'cantidad', busca 'stock'.
    12. También hay una tabla 'productos', que contiene 'caracteristicas' en formato JSON.
    13. Si el usuario pregunta por un producto, devuelve las características en lenguaje natural y claro para el usuario.

    Ahora responde la siguiente pregunta del usuario:
    \"\"\"{question}\"\"\"
    """

system_prompt = SystemMessagePromptTemplate(
    prompt=PromptTemplate(
        input_variables=["usuario_id", "question"],
        template=system_template
    )
)

prompt = ChatPromptTemplate.from_messages([
    system_prompt,
    MessagesPlaceholder(variable_name="chat_history"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# Crear el agente manualmente con soporte para funciones de OpenAI
agent = create_openai_functions_agent(
    llm=llm,
    tools=tools,
    prompt=prompt,
)

# Crear el ejecutor de agente
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors=True
)

print(db.run("SELECT * FROM productos WHERE usuario_id = 1"))

def consultar_db(pregunta: str, usuario_id: int) -> str:
    try:
        resultado = agent_executor.invoke({
            "question": pregunta, # lo pones claramente
            "usuario_id": usuario_id,
            "chat_history": []
        })
        if isinstance(resultado, dict) and "output" in resultado:
            return resultado["output"]
        return resultado
    except Exception as e:
        return f"Error al procesar la pregunta: {str(e)}"