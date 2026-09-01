from api.agent.executor import get_agent_executor
from datetime import date

def consult_db(question: str, user_id: int) -> str:
    try:
        agent_executor = get_agent_executor()
        result = agent_executor.invoke({
            "question": question, 
            "user_id": user_id,
            "current_date": date.today().isoformat(),
            "chat_history": []
        })
        if isinstance(result, dict) and "output" in result:
            return result["output"]
        return result
    except Exception as e:
        return f"Error al procesar la pregunta: {str(e)}"