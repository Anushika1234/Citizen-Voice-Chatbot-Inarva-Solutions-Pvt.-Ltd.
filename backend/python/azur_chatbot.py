import os
import sys
import json
import traceback
from dotenv import load_dotenv
from openai import AzureOpenAI
import langid

# Load env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT")

if not all([AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT]):
    sys.stderr.write("Azure OpenAI environment variables missing\n")
    sys.exit(1)

client = AzureOpenAI(
    api_key=AZURE_OPENAI_KEY,
    api_version="2024-02-15-preview",
    azure_endpoint=AZURE_OPENAI_ENDPOINT
)

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi"
}

class AzureChatbot:
    def __init__(self):
        self.history = []

    def detect_language(self, text):
        lang, _ = langid.classify(text)
        return lang if lang in SUPPORTED_LANGUAGES else "en"

    def get_response(self, query, context="", language=None):
        lang = language or self.detect_language(query)
        lang_name = SUPPORTED_LANGUAGES.get(lang, "English")

        messages = [
            {
                "role": "system",
                "content": f"""
You are an AI assistant for a Pension Grievance Redressal System.
Answer ONLY using the provided context.
Respond in {lang_name}.
If context is insufficient, say you don't know.
"""
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion:\n{query}"
            }
        ]

        try:
            response = client.chat.completions.create(
                model=AZURE_OPENAI_DEPLOYMENT,
                messages=messages,
                temperature=0.3,
                max_tokens=800
            )

            return {
                "response": response.choices[0].message.content,
                "language": lang
            }

        except Exception as e:
            sys.stderr.write(traceback.format_exc())
            return {
                "response": "Sorry, I am unable to answer right now.",
                "language": lang
            }