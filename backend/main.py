from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from llama_index.core import Document, VectorStoreIndex
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.google_genai import GoogleGenAI

load_dotenv()

app = FastAPI(title="LegacyGuide API")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        return {"response": "Hello, world!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Set up LlamaIndex components
example_docs = [
    Document(text="LangChain is a framework for building context-aware reasoning applications.")
]
embed_model = HuggingFaceEmbedding(model_name="Qwen/Qwen3-Embedding-0.6B")
llm =  GoogleGenAI(model="gemini-2.5-flash-preview-05-20", api_key=GEMINI_API_KEY)

# Build the vector index
index = VectorStoreIndex.from_documents(example_docs, embed_model=embed_model)
query_engine = index.as_query_engine(llm=llm)

@app.post("/rag")
async def rag_endpoint(request: ChatRequest):
    try:
        response = query_engine.query(request.message)
        return {"answer": str(response)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 