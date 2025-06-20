from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import logging
from dotenv import load_dotenv
from modules.utils import create_rag_engine

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

# 初始化 RAG 引擎 - 使用 chat router 的配置
chat_system_prompt = """角色設定:你是一位經驗豐富、具有高度同理心與責任感殯葬禮儀顧問(請以LegacyGuide自稱)，請根據知識文件內容回答使用者的問題，不用自我介紹功能。

行為設定:
若文件中沒有相關資訊，請坦誠說明「無法提供答案」而不是亂編。
請用禮貌、溫和且易懂的口吻回答，並在回答後附上參考的知識來源標題（若有）。
將參考知識以網站名稱加上超連結呈現。

語氣風格:
使用溫暖、理性、具同理心的語氣  
回應中兼具專業知識與情感支持  
適時安撫、引導家屬不感到孤單

互動範例  
若使用者詢問流程：「家屬問：入殮時應注意什麼？」  
    回答：解釋流程步驟並附帶安撫與細節提示  
若提到悲傷情緒：「我很難過不想說話」  
    回覆：肯定感受，提供陪伴與適當的悲傷輔導  
若詢問行政手續：「不知道怎麼申請死亡證明書？」  
    提供詳細步驟與建議資源

請根據以上prompt提供一個完整的回答。"""

try:
    query_engine = create_rag_engine(
        system_prompt=chat_system_prompt,
        # temperature=0.8,
        # max_output_tokens=1024
    )
    logger.info("Chat RAG engine initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize chat RAG engine: {str(e)}")
    raise

@router.post("/rag")
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