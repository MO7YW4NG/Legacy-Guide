from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from pathlib import Path
from llama_index.core import Document, VectorStoreIndex, SimpleDirectoryReader
from llama_index.core.chat_engine.types import ChatMode
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.google_genai import GoogleGenAI
from dotenv import load_dotenv
from llama_index.core.prompts import PromptTemplate

load_dotenv()
router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class ChatRequest(BaseModel):
    message: str

# 使用 SimpleDirectoryReader 載入 ./assets 資料夾內的所有文件（Markdown、TXT等） 
reader = SimpleDirectoryReader(input_dir="./assets/")

# 調用 reader，將檔案內容讀進來，變成 Document 物件列表
example_docs = reader.load_data()

# 使用 Hugging Face 的 Qwen 嵌入模型，把文件文字轉成向量
# show_progress_bar=True 會顯示進度條，embed_batch_size 控制每批處理大小
embed_model = HuggingFaceEmbedding(model_name="Qwen/Qwen3-Embedding-0.6B", show_progress_bar=True, embed_batch_size=8)

# 初始化 Google Gemini LLM，指定要用哪個版本，並輸入 API KEY        
llm = GoogleGenAI(model="gemini-2.5-flash-preview-05-20", api_key=GEMINI_API_KEY)

# 自訂 system prompt（系統提示語）
system_prompt = PromptTemplate(
    input_variables=[],
    template="""你是一位專業且謹慎的殯葬禮儀顧問，請根據以下知識文件內容回答使用者的問題。
若文件中沒有相關資訊，請坦誠說明「無法提供答案」而不是亂編。
請用禮貌、溫和且易懂的口吻回答，並在回答後附上參考的知識來源標題（若有）。

使用者問題: {user_question}
知識文件: {retrieved_context}

請根據以上提供一個完整的回答。"""
)

# 自訂 query prompt（查詢提示語）
query_prompt = PromptTemplate(
    input_variables=["query_str"],
    template="以下是使用者的問題，請根據索引內容來回答：\n\n{query_str}"
)

# 把文件做成向量索引（VectorStoreIndex）
# - 會把 example_docs 用 embed_model 轉向量
# - 並建立內部的搜尋索引，show_progress=True 會顯示建索引進度
index = VectorStoreIndex.from_documents(example_docs, show_progress=True, embed_model=embed_model)

# 在這裡傳入自訂 prompts
query_engine = index.as_chat_engine(
    # 把向量索引轉成一個 Chat Engine
    # - llm: 指定要用哪個 LLM 來生成回答
    # - chat_mode: CONDENSE_PLUS_CONTEXT 表示先做檢索，再根據上下文重新撰寫完整回答
    llm=llm,
    chat_mode=ChatMode.CONDENSE_PLUS_CONTEXT,
    system_prompt=system_prompt,
    query_prompt=query_prompt
)

# 定義一個 POST 路由，路徑是 "/rag"
# 當用戶用 POST 請求這個端點時，會執行 rag_endpoint 函式
@router.post("/rag")
async def rag_endpoint(request: ChatRequest):
    try:
        # 使用 query_engine.chat() 方法
        # 將用戶傳進來的問題（request.message）丟進 RAG 聊天引擎
        # RAG 引擎流程：
        # 1) 把問題做向量化
        # 2) 在向量庫裡找相似內容
        # 3) 把找到的內容送給 LLM (Gemini)
        # 4) LLM 產生最終回答
        response = query_engine.chat(request.message)
        return {"answer": str(response)}
    except Exception as e:
        # 若過程中發生任何錯誤（例如找不到向量庫、API KEY 失效）
        # 就回傳 HTTP 500 錯誤，並把錯誤訊息寫進 detail
        raise HTTPException(status_code=500, detail=str(e)) 