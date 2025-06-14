from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from pathlib import Path
from llama_index.core import Document, VectorStoreIndex, SimpleDirectoryReader
from llama_index.core.chat_engine.types import ChatMode
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.google_genai import GoogleGenAI
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class ChatRequest(BaseModel):
    message: str
 
reader = SimpleDirectoryReader(input_dir="./assets/")
example_docs = reader.load_data()

embed_model = HuggingFaceEmbedding(model_name="Qwen/Qwen3-Embedding-0.6B", show_progress_bar=True, embed_batch_size=8)
llm = GoogleGenAI(model="gemini-2.5-flash-preview-05-20", api_key=GEMINI_API_KEY)
index = VectorStoreIndex.from_documents(example_docs, show_progress=True, embed_model=embed_model)
query_engine = index.as_chat_engine(llm=llm, chat_mode=ChatMode.CONDENSE_PLUS_CONTEXT)

@router.post("/rag")
async def rag_endpoint(request: ChatRequest):
    try:
        response = query_engine.chat(request.message)
        return {"answer": str(response)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 