import psycopg2
from transformers import pipeline

# Crear el pipeline para usar GPT-2 o GPT-Neo
local_llm = pipeline('text2text-generation', model='mrm8488/t5-base-finetuned-wikiSQL')

# Establecer conexión con la base de datos SQLite

# Formato de la consulta que usarás para generar las respuestas
formato = """
Dada la siguiente pregunta del usuario, genera solo una consulta SQL válida para obtener la información relacionada:

Pregunta: {question}

Consulta SQL:
"""

def consulta(input_usuario):
    """
    Genera una consulta SQL usando Hugging Face y ejecuta la consulta sobre la base de datos.
    Luego devuelve los resultados de la consulta SQL generada.
    """
    # Formatear la pregunta según el formato definido
    consulta_sql = formato.format(question=input_usuario)
    
    # Usar Hugging Face para generar la consulta SQL a partir de la pregunta
    resultado = local_llm(consulta_sql, max_length=150, num_return_sequences=1)
    
    # Obtener la consulta SQL generada
    consulta_generada = resultado[0]['generated_text']
    consulta_sql_final = consulta_generada.split("Consulta SQL:")[-1].strip()

    # Conexion
    try:
        conn = psycopg2.connect(
            dbname="prueba",
            user="postgres",
            password="3204119316caro",
            host="localhost",
            port="5432"
        )
        cursor = conn.cursor()

        cursor.execute(consulta_sql_final)
        resultados = cursor.fetchall()

        if resultados:
            respuesta = f"Resultados encontrados: {resultados}"
        else:
            respuesta = "No se encontraron resultados."
    
    except Exception as e:
        respuesta = f"Error en la consulta SQL: {str(e)}"
    finally:
        if conn:
            cursor.close()
            conn.close()
    return respuesta