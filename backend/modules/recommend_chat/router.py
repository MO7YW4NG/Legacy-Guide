from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from pathlib import Path
import logging
from llama_index.core import Document, VectorStoreIndex, SimpleDirectoryReader
from llama_index.core.chat_engine.types import ChatMode
from llama_index.embeddings.text_embeddings_inference import TextEmbeddingsInference
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

class ParseConversationRequest(BaseModel):
    conversation_text: str

class ParsedFormData(BaseModel):
    # 往生者基本資料
    deceased_name: str = ""
    gender: str = ""
    birth_date: str = ""
    death_date: str = ""
    zodiac: str = ""
    clash_info: str = ""
    
    # 地點資訊
    location: str = ""
    venue_recommendation: str = ""
    
    # 聯絡人資訊
    contact_name: str = ""
    contact_phone: str = ""
    contact_email: str = ""
    religion: str = ""
    
    # 預算與時程
    budget_min: int = 0
    budget_max: int = 0
    budget_range: str = ""
    completion_days: str = ""
    
    # 方案與特殊需求
    recommended_plan: str = ""
    special_requirements: str = ""

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
        embed_model = TextEmbeddingsInference(
            model_name=os.getenv("EMBEDDING_MODEL_ID"),
            base_url="http://embeddings-inference:80",
            embed_batch_size=32
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
        (1)詢問家屬往生者姓名、性別、生日(推算生肖)、過世日期。
        (2)詢問家屬方便辦喪事的地點，搜尋並推薦龍巖相關設施。
        (3)詢問家屬主要聯絡人姓名、電話、電子郵件、宗教信仰。
        (4)詢問家屬預算範圍。
        (5)系統推薦方案(請根據龍巖生前契約裡的六個方案做推薦，不要跟家屬的ˋ預算範圍差太多都可以)。
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

@router.post("/parse-conversation")
async def parse_conversation(request: ParseConversationRequest):
    try:
        if not request.conversation_text.strip():
            raise HTTPException(status_code=400, detail="對話內容不能為空")

        logger.info("開始解析對話內容")
        
        # 建立專門用於解析的提示詞
        parse_prompt = f"""
請仔細分析以下殯葬服務諮詢的對話記錄，提取關鍵資訊並以JSON格式回傳。

對話記錄：
{request.conversation_text}

請按照以下7個步驟的流程提取資訊：

1. 往生者基本資料：
   - 姓名
   - 性別
   - 生日（用於推算生肖）
   - 過世日期
   - 生肖(以出生日期推算)
   - 沖煞相關說明

2. 辦事地點：
   - 方便辦喪事的地點
   - 推薦的龍巖設施

3. 聯絡人資訊：
   - 主要聯絡人姓名
   - 電話
   - 電子郵件
   - 宗教信仰

4. 預算範圍：
   - 預算金額範圍

5. 推薦方案：
   - 系統推薦的方案內容

6. 完成時程：
   - 期望幾天內完成

7. 特殊需求：
   - 特殊需求或注意事項

請嚴格按照以下JSON格式回傳，如果某項資訊未提及則保持空字串或0：

{{
    "deceased_name": "往生者姓名",
    "gender": "性別(男/女)",
    "birth_date": "生日(YYYY-MM-DD格式)",
    "death_date": "過世日期(YYYY-MM-DD格式)",
    "zodiac": "生肖",
    "clash_info": "沖煞相關說明",
    "location": "辦事地點",
    "venue_recommendation": "推薦設施",
    "contact_name": "聯絡人姓名",
    "contact_phone": "聯絡人電話",
    "contact_email": "聯絡人郵件",
    "religion": "宗教信仰",
    "budget_min": 最低預算數字,
    "budget_max": 最高預算數字,
    "budget_range": "預算範圍描述",
    "completion_days": "完成天數",
    "recommended_plan": "推薦方案",
    "special_requirements": "特殊需求"
}}

請只回傳JSON格式，不要包含其他文字。
"""

        # 使用現有的 LLM 來解析
        llm = GoogleGenAI(
            model="gemini-2.5-flash-preview-05-20",
            api_key=GEMINI_API_KEY
        )
        
        response = llm.complete(parse_prompt)
        response_text = str(response).strip()
        
        logger.info(f"LLM 回應: {response_text}")
        
        # 嘗試解析 JSON
        try:
            # 移除可能的 markdown 代碼塊標記
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            import json
            parsed_data = json.loads(response_text)
            
            # 驗證並清理資料
            form_data = ParsedFormData(**parsed_data)
            
            logger.info("成功解析對話內容")
            return {
                "success": True,
                "parsed_data": form_data.dict(),
                "message": "對話內容解析成功"
            }
            
        except json.JSONDecodeError as je:
            logger.error(f"JSON 解析錯誤: {str(je)}")
            logger.error(f"原始回應: {response_text}")
            
            # 備用解析方法：使用正則表達式提取關鍵資訊
            fallback_data = extract_info_with_regex(request.conversation_text)
            return {
                "success": True,
                "parsed_data": fallback_data,
                "message": "使用備用方法解析對話內容",
                "warning": "LLM JSON解析失敗，使用正則表達式提取"
            }
            
    except Exception as e:
        logger.error(f"解析對話內容時發生錯誤: {str(e)}")
        raise HTTPException(status_code=500, detail=f"解析失敗: {str(e)}")

def extract_info_with_regex(conversation_text: str) -> dict:
    """備用的正則表達式提取方法"""
    import re
    
    extracted = {
        "deceased_name": "",
        "gender": "",
        "birth_date": "",
        "death_date": "",
        "zodiac": "",
        "clash_info": "",
        "location": "",
        "venue_recommendation": "",
        "contact_name": "",
        "contact_phone": "",
        "contact_email": "",
        "religion": "",
        "budget_min": 0,
        "budget_max": 0,
        "budget_range": "",
        "completion_days": "",
        "recommended_plan": "",
        "special_requirements": ""
    }
    
    # 姓名提取
    name_patterns = [
        r'往生者.*?[是叫名為](.{2,4})',
        r'姓名[是：:](.{2,4})',
        r'叫(.{2,4})'
    ]
    for pattern in name_patterns:
        match = re.search(pattern, conversation_text)
        if match:
            extracted["deceased_name"] = match.group(1).strip()
            break
    
    # 性別提取
    if re.search(r'男|先生|爸爸|父親', conversation_text):
        extracted["gender"] = "男"
    elif re.search(r'女|小姐|太太|媽媽|母親', conversation_text):
        extracted["gender"] = "女"
    
    # 預算提取
    budget_match = re.search(r'預算.*?(\d+).*?到.*?(\d+)|(\d+).*?萬', conversation_text)
    if budget_match:
        if budget_match.group(1) and budget_match.group(2):
            extracted["budget_min"] = int(budget_match.group(1)) * 10000
            extracted["budget_max"] = int(budget_match.group(2)) * 10000
        elif budget_match.group(3):
            extracted["budget_max"] = int(budget_match.group(3)) * 10000
    
    # 電話提取
    phone_match = re.search(r'電話.*?(09\d{8}|\d{2,3}-\d{6,8})', conversation_text)
    if phone_match:
        extracted["contact_phone"] = phone_match.group(1)
    
    # 天數提取/看要不要換算成週
    days_match = re.search(r'(\d+)天', conversation_text)
    if days_match:
        extracted["completion_days"] = days_match.group(1) + "天"
    
    return extracted

@router.get("/test-knowledge")
async def test_knowledge_base():
    """測試知識文件是否正確載入"""
    try:
        # 測試簡單問題
        test_response = query_engine.chat("請告訴我龍巖有哪些生前契約方案？")
        
        return {
            "success": True,
            "test_query": "請告訴我龍巖有哪些生前契約方案？",
            "response": str(test_response),
            "message": "知識文件測試成功"
        }
    except Exception as e:
        logger.error(f"知識文件測試失敗: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": "知識文件測試失敗"
        }

@router.get("/debug-assets")
async def debug_assets_path():
    """除錯 assets 路徑資訊"""
    try:
        from pathlib import Path
        import os
        
        current_dir = os.getcwd()
        assets_path = Path("./assets/")
        abs_assets_path = assets_path.resolve()
        
        files_found = []
        if assets_path.exists():
            files_found = [f.name for f in assets_path.iterdir() if f.is_file()]
        
        return {
            "current_working_directory": current_dir,
            "relative_assets_path": str(assets_path),
            "absolute_assets_path": str(abs_assets_path),
            "assets_exists": assets_path.exists(),
            "files_found": files_found,
            "total_files": len(files_found)
        }
    except Exception as e:
        return {
            "error": str(e),
            "message": "除錯資訊獲取失敗"
        }