from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from enum import Enum
import os
import logging
from dotenv import load_dotenv
from llama_index.llms.google_genai import GoogleGenAI
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

class ParseConversationRequest(BaseModel):
    conversation_text: str

class ParsedFormData(BaseModel):
    # 往生者基本資料
    deceased_name: str = ""
    gender: str = ""
    birth_date: str = ""
    death_date: str = ""
    zodiac: str = ""
    # 地點資訊
    city: str = ""
    
    # 聯絡人資訊
    contact_name: str = ""
    contact_phone: str = ""
    contact_email: str = ""
    religion: str = ""
    family_zodiacs: list[str] = []
    
    # 預算與時程
    budget: int = 0
    completion_weeks: int = 0
    
    # 方案與特殊需求
    recommended_plan: str = ""
    special_requirements: str = ""

# 初始化 RAG 引擎 - 使用 recommend_chat router 的配置
recommend_system_prompt = """角色設定:你是一位經驗豐富、具有高度同理心與責任感殯葬禮儀顧問(請以LegacyGuide自稱)，不用自我介紹，輸出不要超過250字。

行為設定:
    1.若文件中沒有相關資訊，請坦誠說明「無法提供答案」而不是亂編。
    2.請用禮貌、溫和且易懂的口吻回答。

語氣風格:
    1.使用溫暖、理性、具同理心的語氣  
    2.回應中兼具專業知識與情感支持  
    3.適時安撫、引導家屬不感到孤單

對話流程:
    1.整體規劃:根據使用者輸入的資訊，推薦方案並說明。
    2.流程範例:
        (1)詢問家屬往生者姓名、性別、生日(推算生肖)、過世日期。
        (2)詢問家屬方便辦喪事的城市。
        (3)詢問家屬主要聯絡人姓名、電話、電子郵件、宗教信仰。
        (4)詢問家屬生肖。
        (5)詢問家屬預算範圍。
        (6)系統推薦方案(請根據龍巖的生前契約方案做推薦，請符合預算範圍)。
        (7)詢問家屬期望在幾週內完成。
        (8)詢問家屬有無特殊需求。

請一步步思考並提供一個完整的回答"""

try:
    query_engine = create_rag_engine(
        system_prompt=recommend_system_prompt,
        temperature=1,  # 稍微降低溫度，更專注於推薦
    )
    logger.info("Recommend chat RAG engine initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize recommend chat RAG engine: {str(e)}")
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

2. 辦事地點：
   - 方便辦喪事的城市

3. 聯絡人資訊：
   - 主要聯絡人姓名
   - 電話
   - 電子郵件
   - 宗教信仰(佛教/道教/基督教/天主教/無宗教信仰)
   - 家屬生肖
    
4. 預算範圍：
   - 預算金額

5. 推薦方案：
   - 系統推薦的龍巖生前契約方案內容

6. 完成時程：
   - 期望幾週內完成

7. 特殊需求：
   - 特殊需求或注意事項

請嚴格按照以下JSON格式回傳，如果某項資訊未提及則保持空字串、空list或0：
```json
{{
    "deceased_name": "往生者姓名",
    "gender": "性別(男/女)",
    "birth_date": "生日(YYYY-MM-DD格式)",
    "death_date": "過世日期(YYYY-MM-DD格式)",
    "zodiac": "生肖",
    "city": "城市",
    "contact_name": "聯絡人姓名",
    "contact_phone": "聯絡人電話",
    "contact_email": "聯絡人郵件",
    "religion": "宗教信仰(佛教/道教/基督教/天主教/無宗教信仰)",
    "family_zodiacs": ["家屬生肖", "家屬生肖2"],
    "budget": 預算數字,
    "completion_weeks": 完成週數數字,
    "recommended_plan": "推薦方案名稱(請參考龍巖的生前契約方案)",
    "special_requirements": "特殊需求"
}}
```

請只回傳JSON格式，不要包含其他文字。
"""

        # 使用現有的 LLM 來解析
        llm = GoogleGenAI(
            model="gemini-2.5-flash",
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
        "city": "",
        "contact_name": "",
        "contact_phone": "",
        "contact_email": "",
        "family_zodiacs": [],
        "religion": "",
        "budget": 0,
        "completion_weeks": 0,
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

    # 城市提取
    city_match = re.search(r'(?:地點|城市).*?[在是]?[:：]?\s*(\w+[市縣])', conversation_text)
    if city_match:
        extracted["city"] = city_match.group(1).strip()

    # 家屬生肖提取
    zodiac_match = re.search(r'家屬生肖(?:有|是|：|:)\s*([^\n\r]+)', conversation_text)
    if zodiac_match:
        zodiac_str = zodiac_match.group(1)
        all_zodiacs = "鼠牛虎兔龍蛇馬羊猴雞狗豬"
        found_zodiacs = [z for z in zodiac_str if z in all_zodiacs]
        if found_zodiacs:
            extracted["family_zodiacs"] = found_zodiacs
    
    # 預算提取
    budget_match = re.search(r'預算.*?(\d+).*?萬', conversation_text)
    if budget_match:
        extracted["budget"] = int(budget_match.group(1)) * 10000

    # 電話提取
    phone_match = re.search(r'電話.*?(09\d{8}|\d{2,3}-\d{6,8})', conversation_text)
    if phone_match:
        extracted["contact_phone"] = phone_match.group(1)
    
    # 天數提取/看要不要換算成週
    weeks_match = re.search(r'(\d+)周', conversation_text)
    if weeks_match:
        extracted["completion_weeks"] = int(weeks_match.group(1))
    
    # 特殊需求提取
    requirements_match = re.search(r'特殊需求.*?[是為有：:]\s*([^\n\r]+)', conversation_text)
    if requirements_match:
        extracted["special_requirements"] = requirements_match.group(1).strip()
    
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