from pydantic import BaseModel
from typing import List
from datetime import date, datetime

class GanZhi(BaseModel):
    年: str
    月: str
    日: str

class Date(BaseModel):
    lunar: str
    solar: str

class LunarInfo(BaseModel):
    日期: Date
    農曆: str
    年: int
    月: int
    日: int
    節氣: str
    宜: List[str]
    忌: List[str]
    沖煞: str
    干支: GanZhi
    生肖: str

class RitualDates(BaseModel):
    頭七: Date
    二七: Date
    三七: Date
    四七: Date
    五七: Date
    六七: Date
    滿七: Date
    百日: Date
    對年: Date

class AuspiciousDayRequest(BaseModel):
    亡者生肖: str
    亡者歿日: date
    家屬生肖: List[str]  # 主要家屬（配偶、子女、媳婦、長孫）
    查詢起始日期: date
    查詢結束日期: date

class ConflictInfo(BaseModel):
    類型: str  # "天干相沖", "地支相沖", "歲次沖煞", "禁忌日"
    說明: str
    影響程度: str  # "嚴重", "中等", "輕微"

class DateAnalysis(BaseModel):
    日期: date
    農曆資訊: LunarInfo
    衝突列表: List[ConflictInfo]
    推薦等級: str  # "極佳", "適宜", "普通", "不宜", "禁用"
    推薦理由: str
    注意事項: List[str]

class AuspiciousDayResponse(BaseModel):
    查詢條件: AuspiciousDayRequest
    推薦日期: List[DateAnalysis]
    總體建議: str
    查詢時間: datetime