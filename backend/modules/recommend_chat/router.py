from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from pathlib import Path
import logging
from llama_index.core import Document, VectorStoreIndex, SimpleDirectoryReader
from llama_index.core.chat_engine.types import ChatMode
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.google_genai import GoogleGenAI
from dotenv import load_dotenv
from llama_index.core.prompts import PromptTemplate

# 設定日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 載入環境變數
load_dotenv()
router = APIRouter()

# 檢查必要的環境變數
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

class ChatRequest(BaseModel):
    message: str

def initialize_rag_engine():
    try:
        # 檢查 assets 目錄是否存在
        assets_path = Path("./assets/")
        if not assets_path.exists():
            raise FileNotFoundError(f"Assets directory not found at {assets_path}")

        # 使用 SimpleDirectoryReader 載入文件
        reader = SimpleDirectoryReader(input_dir="./assets/")
        example_docs = reader.load_data()
        
        if not example_docs:
            raise ValueError("No documents found in assets directory")

        # 初始化嵌入模型
        embed_model = HuggingFaceEmbedding(
            model_name="Qwen/Qwen3-Embedding-0.6B",
            show_progress_bar=True,
            embed_batch_size=8
        )

        # 初始化 LLM
        llm = GoogleGenAI(
            model="gemini-2.5-flash-preview-05-20",
            api_key=GEMINI_API_KEY
        )

        # 建立向量索引
        index = VectorStoreIndex.from_documents(
            example_docs,
            show_progress=True,
            embed_model=embed_model
        )

        # 設定系統提示詞
        system_prompt = """角色設定:你是一位經驗豐富、具有高度同理心與責任感殯葬禮儀顧問(請以LegacyGuide自稱)，請根據知識文件內容回答使用者的問題，不用自我介紹功能。

行為設定:
    1.若文件中沒有相關資訊，請坦誠說明「無法提供答案」而不是亂編。
    2.請用禮貌、溫和且易懂的口吻回答，並在回答後附上參考的知識來源標題（若有）。
    3.將參考知識以網站名稱加上超連結呈現。

語氣風格:
    1.使用溫暖、理性、具同理心的語氣  
    2.回應中兼具專業知識與情感支持  
    3.適時安撫、引導家屬不感到孤單

對話流程:
    1.整體規劃:根據使用者輸入的資訊，推薦方案並說明。
    2.流程範例:
        (1)詢問家屬往生者姓名、性別、生日(推算生肖)、過世日期，做沖煞判斷後給予相關說明。
        (2)詢問家屬方便辦喪事的地點，搜尋並推薦龍巖相關設施。
        (3)詢問家屬主要聯絡人姓名、電話、電子郵件、宗教信仰。
        (4)詢問家屬預算範圍。
        (5)系統推薦方案(請根據知識文件內容裡的六個方案做推薦，價格不要差太多都可以)。
        (6)詢問家屬期望在幾天內完成。
        (7)詢問家屬有無特殊需求，並根據特殊需求調整方案內容。

請根據以上prompt提供一個完整的回答。"""

        # 建立聊天引擎
        query_engine = index.as_chat_engine(
            llm=llm,
            chat_mode=ChatMode.CONDENSE_PLUS_CONTEXT,
            system_prompt=system_prompt
        )

        return query_engine

    except Exception as e:
        logger.error(f"Error initializing RAG engine: {str(e)}")
        raise

# 初始化 RAG 引擎
try:
    query_engine = initialize_rag_engine()
    logger.info("RAG engine initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize RAG engine: {str(e)}")
    raise

@router.post("/rag2")
async def rag_endpoint(request: ChatRequest):
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        logger.info(f"Received question: {request.message}")
        
        # 使用 RAG 引擎處理問題
        response = query_engine.chat(request.message)
        
        logger.info("Successfully generated response")
        return {"answer": str(response)}

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 