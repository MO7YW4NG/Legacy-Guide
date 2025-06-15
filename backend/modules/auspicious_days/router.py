"""
吉日推薦模組的 FastAPI 路由
提供吉日推薦的 API 端點
"""

from fastapi import APIRouter, HTTPException
from ..models import AuspiciousDayRequest, AuspiciousDayResponse
from .service import AuspiciousDayService

router = APIRouter(
    prefix="/auspicious-days",
    tags=["吉日推薦"],
    responses={
        404: {"description": "找不到請求的資源"},
        500: {"description": "伺服器內部錯誤"}
    }
)

service = AuspiciousDayService()

@router.post("/recommend", response_model=AuspiciousDayResponse)
async def recommend_dates(request: AuspiciousDayRequest):
    """
    推薦適合舉行喪葬儀式的吉日
    
    - **亡者生肖**: 亡者的生肖（如：鼠、牛、虎等）
    - **亡者歿日**: 亡者過世的日期
    - **家屬生肖**: 主要家屬的生肖列表
    - **查詢起始日期**: 開始查詢的日期
    - **查詢結束日期**: 結束查詢的日期

    返回推薦的吉日列表，包含每個日期的詳細分析和建議
    """
    # try:
    return await service.recommend_dates(request)
    # except Exception as e:
    #     raise HTTPException(
    #         status_code=500,
    #         detail=f"推薦吉日時發生錯誤：{str(e)}"
    #     ) 