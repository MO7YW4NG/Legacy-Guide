from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from pathlib import Path
from llama_index.core import Document, VectorStoreIndex
from llama_index.core.chat_engine.types import ChatMode
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.google_genai import GoogleGenAI
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class ChatRequest(BaseModel):
    message: str
 
# 初始化 assts 資料夾內的所有.md檔案 (encoding="utf-8")
example_docs = [
    Document(text=f.read_text(encoding="utf-8"))
    for f in Path("assets").glob("*.md")
]

embed_model = HuggingFaceEmbedding(model_name="Qwen/Qwen3-Embedding-0.6B", embed_batch_size=32)
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