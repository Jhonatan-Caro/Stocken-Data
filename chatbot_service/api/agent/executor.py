from api.agent.llm import build_llm
from api.agent.prompt import prompt
from api.tools.registry import ALL_TOOLS
from langchain.agents import AgentExecutor, create_openai_functions_agent

_agent_executor = None

def _build_agent_executor():
    llm = build_llm()
    tools = ALL_TOOLS
    agent = create_openai_functions_agent(llm=llm, tools=tools, prompt=prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=True, handle_parsing_errors=True)

def get_agent_executor():
    global _agent_executor
    if _agent_executor is None:
        _agent_executor = _build_agent_executor()
    return _agent_executor