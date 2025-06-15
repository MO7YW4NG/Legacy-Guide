"""
吉日推薦模組的核心服務
實現吉日推薦的主要業務邏輯
"""

from datetime import date, datetime, timedelta
from typing import List, Dict
from ..models import (
    AuspiciousDayRequest,
    AuspiciousDayResponse,
    DateAnalysis,
    ConflictInfo,
    LunarInfo,
    GanZhi,
    Date
)
from .utils import (
    get_earthly_branch_conflicts,
    zodiac_to_earthly_branch,
    is_forbidden_day,
    calculate_recommendation_level
)
from ..lunar.router import get_lunar_info as get_lunar_info_from_module

class AuspiciousDayService:
    def __init__(self):
        # 初始化禁忌日期常數
        self.重喪日 = {
            1: "甲", 2: "乙", 3: "戊", 4: "丙", 
            5: "丁", 6: "己", 7: "庚", 8: "辛", 
            9: "戊", 10: "壬", 11: "癸", 12: "己"
        }
    
    async def analyze_date(self, date: date, request: AuspiciousDayRequest) -> DateAnalysis:
        """分析單一日期的適宜程度"""
        # 獲取農曆資訊
        lunar_info = await self.get_lunar_info(date)
        
        # 檢查各種沖煞和禁忌
        conflicts = self.check_conflicts(lunar_info, request)
        
        # 計算推薦等級
        recommendation_level = calculate_recommendation_level(
            conflicts,
            (lunar_info.宜, lunar_info.忌)
        )
        
        # 生成推薦說明
        explanation = self.generate_explanation(conflicts, lunar_info, recommendation_level)
        
        # 生成注意事項
        notes = self.generate_notes(conflicts, lunar_info)
        
        return DateAnalysis(
            日期=date,
            農曆資訊=lunar_info,
            衝突列表=conflicts,
            推薦等級=recommendation_level,
            推薦理由=explanation,
            注意事項=notes
        )
    
    async def get_lunar_info(self, date: date) -> LunarInfo:
        """整合現有農曆模組，獲取日期的 LunarInfo"""
        # 將 date 物件轉換為 YYYY-MM-DD 格式的字串
        date_str = date.strftime("%Y-%m-%d")
        # 調用 lunar 模組的 get_lunar_info 函數
        return get_lunar_info_from_module(date_str)
    
    def check_conflicts(self, lunar_info: LunarInfo, request: AuspiciousDayRequest) -> List[ConflictInfo]:
        """檢查各種沖煞和禁忌"""
        conflicts = []
        
        # 檢查重喪日等絕對禁忌
        forbidden_conflicts = self.check_forbidden_days(lunar_info.日期, lunar_info.干支)
        conflicts.extend(forbidden_conflicts)
        
        # 檢查生肖相沖
        zodiac_conflicts = self.check_zodiac_conflicts(
            lunar_info,
            request.亡者生肖,
            request.家屬生肖
        )
        conflicts.extend(zodiac_conflicts)
        
        return conflicts
    
    def check_forbidden_days(self, date: Date, 天干支: GanZhi) -> List[ConflictInfo]:
        """檢查重喪日、歲破日等絕對禁忌"""
        conflicts = []
        
        # 檢查重喪日
        is_forbidden, reason = is_forbidden_day(date, 天干支)
        if is_forbidden:
            conflicts.append(ConflictInfo(
                類型="禁忌日",
                說明=reason,
                影響程度="嚴重"
            ))
        
        return conflicts
    
    def check_zodiac_conflicts(self, lunar_info: LunarInfo, 亡者生肖: str, 家屬生肖: List[str]) -> List[ConflictInfo]:
        """檢查生肖相沖"""
        conflicts = []
        
        # 檢查亡者生肖相沖
        亡者地支 = zodiac_to_earthly_branch(亡者生肖)
        日支 = lunar_info.干支.日[1]  # 取日干支的地支部分
        
        if get_earthly_branch_conflicts(亡者地支) == 日支:
            conflicts.append(ConflictInfo(
                類型="生肖相沖",
                說明=f"亡者生肖{亡者生肖}與日支{日支}相沖",
                影響程度="嚴重"
            ))
        
        # 檢查家屬生肖相沖
        for 生肖 in 家屬生肖:
            家屬地支 = zodiac_to_earthly_branch(生肖)
            if get_earthly_branch_conflicts(家屬地支) == 日支:
                conflicts.append(ConflictInfo(
                    類型="生肖相沖",
                    說明=f"家屬生肖{生肖}與日支{日支}相沖",
                    影響程度="中等"
                ))
        
        return conflicts
    
    def generate_explanation(self, conflicts: List[ConflictInfo], lunar_info: LunarInfo, level: str) -> str:
        """生成推薦說明"""
        if level == "禁用":
            return "此日期有嚴重禁忌，不建議使用"
        elif level == "不宜":
            return "此日期有較多沖煞，建議另擇他日"
        elif level == "極佳":
            return "此日期非常適合舉行儀式，無明顯沖煞"
        elif level == "適宜":
            return "此日期適合舉行儀式，但需注意部分事項"
        else:
            return "此日期尚可，但建議優先考慮其他更適合的日期"
    
    def generate_notes(self, conflicts: List[ConflictInfo], lunar_info: LunarInfo) -> List[str]:
        """生成注意事項"""
        notes = []
        
        # 添加宜忌事項
        if lunar_info.宜:
            notes.append(f"宜：{', '.join(lunar_info.宜)}")
        if lunar_info.忌:
            notes.append(f"忌：{', '.join(lunar_info.忌)}")
        
        # 添加沖煞說明
        if lunar_info.沖煞:
            notes.append(f"沖煞：{lunar_info.沖煞}")
        
        # 添加其他注意事項
        for conflict in conflicts:
            notes.append(conflict.說明)
        
        return notes
    
    async def recommend_dates(self, request: AuspiciousDayRequest) -> AuspiciousDayResponse:
        """主要推薦邏輯"""
        recommended_dates = []
        
        # 遍歷日期範圍
        current_date = request.查詢起始日期
        while current_date <= request.查詢結束日期:
            analysis = await self.analyze_date(current_date, request)
            if analysis.推薦等級 in ["極佳"]:
                recommended_dates.append(analysis)
            current_date = current_date + timedelta(days=1)
        
        # 按推薦等級排序
        recommended_dates.sort(key=lambda x: x.日期)
        
        return AuspiciousDayResponse(
            查詢條件=request,
            推薦日期=recommended_dates,
            # 總體建議=self.generate_overall_advice(recommended_dates),
            查詢時間=datetime.now()
        )
    
    # def generate_overall_advice(self, recommended_dates: List[DateAnalysis]) -> str:
    #     """生成總體建議"""
    #     if not recommended_dates:
    #         return "在查詢日期範圍內未找到適合的日期，建議擴大查詢範圍或調整條件"
        
    #     best_dates = [d for d in recommended_dates if d.推薦等級 == "極佳"]
    #     if best_dates:
    #         return f"找到{len(best_dates)}個極佳日期，建議優先考慮這些日期"
    #     else:
    #         return f"找到{len(recommended_dates)}個適宜日期，請參考具體建議選擇" 