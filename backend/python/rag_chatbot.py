import os
import sys
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from openai import AzureOpenAI
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-02-15-preview",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

EMBEDDING_MODEL = os.getenv("AZURE_OPENAI_EMBEDDING_MODEL")

DATA_PATH = os.path.join(
    os.path.dirname(__file__),
    "..", "data", "pension_grievance_dataset_1500.csv"
)

class RAGChatbot:
    def __init__(self):
        self.df = pd.read_csv(DATA_PATH).dropna()
        self.embeddings = self._embed(self.df["query"].tolist())

    def _embed(self, texts):
        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=texts
        )
        return np.array([e.embedding for e in response.data])

    def retrieve(self, query, k=3):
        query_embedding = self._embed([query])[0]
        scores = cosine_similarity([query_embedding], self.embeddings)[0]
        top_idx = scores.argsort()[-k:][::-1]
        return "\n".join(self.df.iloc[top_idx]["sample_response"].tolist())