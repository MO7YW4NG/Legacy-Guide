from pydantic import BaseModel
from typing import List

class GanZhi(BaseModel):
    年: str
    月: str
    日: str

class LunarInfo(BaseModel):
    公曆: str
    農曆: str
    節氣: str
    宜: List[str]
    忌: List[str]
    沖煞: str
    干支: GanZhi
    生肖: str
