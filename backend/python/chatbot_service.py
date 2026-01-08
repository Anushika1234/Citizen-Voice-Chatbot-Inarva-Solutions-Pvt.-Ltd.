import sys
import os
import json

# Ensure current folder is in sys.path
sys.path.append(os.path.dirname(__file__))

# Import your chatbot classes
from azure_chatbot import AzureChatbot
from rag_chatbot import RAGChatbot

# Initialize chatbots once
llm = AzureChatbot()
rag = RAGChatbot()

def get_answer(query, language=None):
    """
    Get response from the LLM, using RAG for context.
    """
    context = rag.retrieve(query)
    return llm.get_response(query, context=context, language=language)


# 🔥 VERY IMPORTANT: Allows script to be run from command line
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python chatbot_service.py '<json_payload>'")
        sys.exit(1)

    try:
        # Parse JSON payload from command-line argument
        payload = json.loads(sys.argv[1])
    except json.JSONDecodeError as e:
        print(f"Invalid JSON: {e}")
        sys.exit(1)

    query = payload.get("query")
    language = payload.get("language")

    if not query:
        print("Error: 'query' field is required in JSON payload")
        sys.exit(1)

    # Get answer and print it
    answer = get_answer(query, language=language)
    print(answer)