"""
吉日推薦模組的工具函數
包含天干地支相沖判斷、生肖轉換等基礎功能
"""

from typing import List, Tuple
from datetime import date
from ..models import GanZhi, Date   

# 天干相沖對應表
HEAVENLY_STEM_CONFLICTS = {
    "甲": "庚", "庚": "甲",
    "乙": "辛", "辛": "乙",
    "丙": "壬", "壬": "丙",
    "丁": "癸", "癸": "丁",
    "戊": "己", "己": "戊"
}

# 地支相沖對應表
EARTHLY_BRANCH_CONFLICTS = {
    "子": "午", "午": "子",
    "丑": "未", "未": "丑",
    "寅": "申", "申": "寅",
    "卯": "酉", "酉": "卯",
    "辰": "戌", "戌": "辰",
    "巳": "亥", "亥": "巳"
}

# 生肖對應地支
ZODIAC_TO_BRANCH = {
    "鼠": "子", "牛": "丑", "虎": "寅", "兔": "卯",
    "龍": "辰", "蛇": "巳", "馬": "午", "羊": "未",
    "猴": "申", "雞": "酉", "狗": "戌", "豬": "亥"
}

def get_heavenly_stem_conflicts(天干: str) -> str:
    """天干相沖判斷：甲庚、乙辛、丙壬、丁癸、戊己"""
    return HEAVENLY_STEM_CONFLICTS.get(天干, "")

def get_earthly_branch_conflicts(地支: str) -> str:
    """地支相沖判斷：子午、丑未、寅申、卯酉、辰戌、巳亥"""
    return EARTHLY_BRANCH_CONFLICTS.get(地支, "")

def zodiac_to_earthly_branch(生肖: str) -> str:
    """生肖轉換為地支"""
    return ZODIAC_TO_BRANCH.get(生肖, "")

def get_year_stem_branch(year: int) -> str:
    """計算年份的干支"""
    # 天干
    heavenly_stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
    # 地支
    earthly_branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
    
    stem_index = (year - 4) % 10
    branch_index = (year - 4) % 12
    
    return heavenly_stems[stem_index] + earthly_branches[branch_index]

def is_forbidden_day(date: Date, 天干支: GanZhi) -> Tuple[bool, str]:
    """判斷是否為禁忌日期"""
    # 重喪日判斷
    重喪日 = {
        1: "甲", 2: "乙", 3: "戊", 4: "丙", 
        5: "丁", 6: "己", 7: "庚", 8: "辛", 
        9: "戊", 10: "壬", 11: "癸", 12: "己"
    }
    
    try:
        # 從農曆日期中提取月份
        lunar_parts = date.lunar.split("-")
        if len(lunar_parts) < 2 or not lunar_parts[1]:
            print(f"警告：無法解析農曆日期 {date.lunar}")
            return False, ""
            
        lunar_month = int(lunar_parts[1])
        
        if 天干支.日 in 重喪日.get(lunar_month, ""):
            return True, f"重喪日：{lunar_month}月{天干支.日}日"
        
        return False, ""
    except (ValueError, IndexError) as e:
        print(f"警告：解析農曆日期時發生錯誤 {e}，日期：{date.lunar}")
        return False, ""

def calculate_recommendation_level(conflicts: List[dict], 宜忌: Tuple[List[str], List[str]]) -> str:
    """根據衝突和宜忌計算推薦等級"""
    宜, 忌 = 宜忌
    
    # 計算衝突嚴重程度
    severe_conflicts = sum(1 for c in conflicts if c.影響程度 == "嚴重")
    moderate_conflicts = sum(1 for c in conflicts if c.影響程度 == "中等")
    
    # 計算宜忌數量
    favorable_count = len([i for i in 宜 if i in ["祭祀", "安葬", "入殮"]])
    unfavorable_count = len([i for i in 忌 if i in ["祭祀", "安葬", "入殮"]])
    
    if severe_conflicts > 0:
        return "禁用"
    elif moderate_conflicts > 1:
        return "不宜"
    elif moderate_conflicts == 1 and unfavorable_count > 0:
        return "不宜"
    elif favorable_count > 0 and unfavorable_count == 0:
        return "極佳"
    elif favorable_count > 0:
        return "適宜"
    else:
        return "普通" 