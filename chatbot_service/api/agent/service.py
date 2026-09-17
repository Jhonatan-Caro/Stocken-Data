from api.agent.executor import get_agent_executor
from api.agent.context import set_request_identity, reset_request_identity
from datetime import date

def consult_db(question: str, user_id: int, user_token: str) -> str:
    tokens = set_request_identity(user_id, user_token)
    try:
        agent_executor = get_agent_executor()
        result = agent_executor.invoke({
            "question": question,
            "current_date": date.today().isoformat(),
            "chat_history": []
        })
        if isinstance(result, dict) and "output" in result:
            return result["output"]
        return result
    except Exception as e:
        return f"Error al procesar la pregunta: {str(e)}"
    finally:
        reset_request_identity(tokens)