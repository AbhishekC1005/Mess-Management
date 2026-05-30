import logging
import json
from datetime import date
from typing import TypedDict, Optional, Annotated
from langchain_litellm import ChatLiteLLM
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from app.config import get_settings
from app.tools.customer_tools import (
    skip_meal,
    bulk_skip_meals,
    pause_subscription,
    resume_subscription,
    check_subscription,
    lookup_customer,
)

logger = logging.getLogger(__name__)
settings = get_settings()

# All available tools
TOOLS = [skip_meal, bulk_skip_meals, pause_subscription, resume_subscription, check_subscription, lookup_customer]


SYSTEM_PROMPT = """You are a helpful mess management assistant bot. You help customers manage their meal subscriptions via Telegram.

You can help with:
1. **Skip meals** - Skip today's lunch, dinner, or both ("I won't come today", "skip lunch"). Tool: `skip_meal`
2. **Bulk skip** - Skip meals for consecutive multiple days ("skip lunch for next 3 days"). Tool: `bulk_skip_meals`
3. **Pause subscription** - Pause all meals indefinitely ("pause my subscription"). Tool: `pause_subscription`
4. **Resume subscription** - Resume from a pause ("resume my meals"). Tool: `resume_subscription`
5. **Check status** - View subscription details, plan type, meals used, and dues ("what's my status?", "what is my plan?", "check my subscription"). Tool: `check_subscription`

IMPORTANT CONTEXT:
- Customer ID: {customer_id}
- Customer Name: {customer_name}
- Current Plan: {plan}
- Current Status: {status}
- Today's Date: {today}

RULES:
- Always use the Customer ID provided in the context when calling any tool.
- **Greetings**: If the user greets you (e.g., "Hi", "Hello", "Hey"), respond warmly and politely. Greet them by their name, state that you are their Mess Management Assistant, and ask how you can help them today (e.g., skipping meals, pausing/resuming subscription, or checking status).
- **Subscription Queries**: If the user asks about their plan, status, subscription details, or says "what is my plan", check if you have already called the `check_subscription` tool in the conversation history. If not, call `check_subscription` to fetch their subscription details. If you have already called the tool and have the result in the conversation history, do NOT call it again; instead, summarize the plan, status, meals used, and dues for the user directly.
- **Date calculations**: If the user says "today" or doesn't specify a date, use today's date. If the user says "tomorrow", calculate it from today.
- **Meal type**: For meal skipping, if not specified and the plan is "Both", default to "Both". If the plan is "Lunch" or "Dinner", use that.
- Be friendly, concise, and confirm actions after they complete.
- Format responses nicely for Telegram (short, use bold text and bullet points where helpful, and use emojis sparingly).
"""


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    customer_id: str
    customer_name: str
    plan: str
    status: str


def create_agent_graph():
    """Create the LangGraph agent for processing user messages."""
    import os
    if settings.litellm_api_key:
        model_lower = settings.litellm_model_name.lower()
        if model_lower.startswith("gemini"):
            os.environ["GEMINI_API_KEY"] = settings.litellm_api_key
        elif model_lower.startswith("openai"):
            os.environ["OPENAI_API_KEY"] = settings.litellm_api_key
        elif model_lower.startswith("anthropic"):
            os.environ["ANTHROPIC_API_KEY"] = settings.litellm_api_key
        elif model_lower.startswith("cohere"):
            os.environ["COHERE_API_KEY"] = settings.litellm_api_key

    llm = ChatLiteLLM(
        model=settings.litellm_model_name,
        api_key=settings.litellm_api_key,
        api_base=settings.litellm_base_url if settings.litellm_base_url else None,
        temperature=0.1,
        max_tokens=512,
    )

    llm_with_tools = llm.bind_tools(TOOLS)

    def agent_node(state: AgentState):
        """Main agent node - calls LLM with tools."""
        system_msg = SystemMessage(
            content=SYSTEM_PROMPT.format(
                customer_id=state["customer_id"],
                customer_name=state["customer_name"],
                plan=state["plan"],
                status=state["status"],
                today=date.today().isoformat(),
            )
        )
        messages = [system_msg] + state["messages"]
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}

    def should_continue(state: AgentState):
        """Check if we need to call tools or are done."""
        last_msg = state["messages"][-1]
        if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
            return "tools"
        return END

    # Build the graph
    tool_node = ToolNode(TOOLS)

    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)

    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
    graph.add_edge("tools", "agent")

    return graph.compile()


# Compiled graph singleton
_agent_graph = None


def get_agent_graph():
    global _agent_graph
    if _agent_graph is None:
        _agent_graph = create_agent_graph()
    return _agent_graph


async def process_message(
    user_message: str,
    customer_id: str,
    customer_name: str,
    plan: str,
    status: str,
) -> str:
    """Process a user message through the LangGraph agent and return the response."""
    graph = get_agent_graph()

    # Fetch persistent 12-hour chat history from PostgreSQL
    from app.services.database import get_chat_history, save_chat_message
    history = await get_chat_history(customer_id, limit=10)

    # Append new user message to the context history
    messages = history + [HumanMessage(content=user_message)]

    initial_state: AgentState = {
        "messages": messages,
        "customer_id": customer_id,
        "customer_name": customer_name,
        "plan": plan,
        "status": status,
    }

    try:
        result = await graph.ainvoke(initial_state)
        # Get the last AI message
        response_text = None
        for msg in reversed(result["messages"]):
            if isinstance(msg, AIMessage) and msg.content:
                response_text = msg.content
                break

        if not response_text:
            response_text = "I processed your request but couldn't generate a response. Please try again."

        # Save both messages to database asynchronously (in the background)
        # Note: We run them as background tasks or await them. Since they are super fast, we can just await them.
        await save_chat_message(customer_id, "user", user_message)
        await save_chat_message(customer_id, "assistant", response_text)

        return response_text
    except Exception as e:
        logger.error(f"Agent error: {e}", exc_info=True)
        return f"Sorry, I encountered an error processing your request. Please try again later."
