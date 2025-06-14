from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from llama_index.core import Document, VectorStoreIndex
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.google_genai import GoogleGenAI
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class ChatRequest(BaseModel):
    message: str

# 初始化 RAG 元件
example_docs = [
    Document(text="LangChain is a framework for building context-aware reasoning applications.")
]
embed_model = HuggingFaceEmbedding(model_name="Qwen/Qwen3-Embedding-0.6B")
llm = GoogleGenAI(model="gemini-2.5-flash-preview-05-20", api_key=GEMINI_API_KEY)
index = VectorStoreIndex.from_documents(example_docs, embed_model=embed_model)
query_engine = index.as_query_engine(llm=llm)

@router.post("/rag")
async def rag_endpoint(request: ChatRequest):
    try:
        response = query_engine.query(request.message)
        return {"answer": str(response)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 