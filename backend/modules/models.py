from pydantic import BaseModel
from typing import List

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