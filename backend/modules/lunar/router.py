from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from lunar_python import Solar, Lunar
from opencc import OpenCC
from modules.models import GanZhi, LunarInfo, Date, RitualDates
import re


router = APIRouter()
cc = OpenCC('s2t')  # 簡體轉繁體

@router.get("/lunar", response_model=LunarInfo)
def get_lunar_endpoint(date: str = Query(..., description="格式：YYYY-MM-DD")) -> LunarInfo:
    return get_lunar_info(date)

def get_lunar_info(date: str) -> LunarInfo:
    solar = Solar.fromYmd(*map(int, date.split("-")))
    lunar = solar.getLunar()
    return LunarInfo(
        日期=Date(
            lunar=lunar_str_to_digits(cc.convert(lunar.toString())),
            solar=date
        ),
        農曆=cc.convert(lunar.toString()),
        年=lunar.getYear(),
        月=lunar.getMonth(),
        日=lunar.getDay(),
        節氣=cc.convert(lunar.getJieQi()),
        宜=[cc.convert(item) for item in lunar.getDayYi()],
        忌=[cc.convert(item) for item in lunar.getDayJi()],
        沖煞=cc.convert(lunar.getChongDesc()),
        干支=GanZhi(
            年=cc.convert(lunar.getYearInGanZhi()),
            月=cc.convert(lunar.getMonthInGanZhi()),
            日=cc.convert(lunar.getDayInGanZhi())
        ),
        生肖=cc.convert(lunar.getYearShengXiao()),
    )

@router.get("/die", response_model=RitualDates)
def ritual_dates(
    date: str = Query(..., description="格式：YYYY-MM-DD"),
    traditional: bool = Query(True, description="作七模式: 是否為traditional (預設為True)"),
) -> RitualDates:
    """
    回傳所有祭祀日期（頭七~滿七、百日、對年），支援傳統49天與現代24天模式。
    """
    from datetime import datetime, timedelta
    try:
        death_date = datetime.strptime(date, "%Y-%m-%d")
        ritual_dates_dict = {}

        # 作七日期
        if traditional:
            offsets = [
                ("頭七", 6),
                ("二七", 13),
                ("三七", 20),
                ("四七", 27),
                ("五七", 34),
                ("六七", 41),
                ("滿七", 48),
            ]
        else:
            offsets = [
                ("頭七", 6),
                ("二七", 9),
                ("三七", 12),
                ("四七", 15),
                ("五七", 18),
                ("六七", 21),
                ("滿七", 24),
            ]

        for name, offset in offsets:
            solar_str = (death_date + timedelta(days=offset)).strftime("%Y-%m-%d")
            lunar_info = get_lunar_info(solar_str)
            ritual_dates_dict[name] = Date(
                lunar=lunar_info.日期.lunar,
                solar=solar_str
            )

        # 百日：陽曆加99天，不考慮閏月
        solar_bairi = (death_date + timedelta(days=99)).strftime("%Y-%m-%d")
        lunar_bairi = get_lunar_info(solar_bairi).日期.lunar
        ritual_dates_dict["百日"] = Date(
            lunar=lunar_bairi,
            solar=solar_bairi
        )

        # 對年：農曆同月同日，遇閏月提前
        dui_nian = get_anniversary_date(date, 1)
        lunar_duinian = get_lunar_info(dui_nian).日期.lunar
        ritual_dates_dict["對年"] = Date(
            lunar=lunar_duinian,
            solar=dui_nian
        )

        return RitualDates(**ritual_dates_dict)
    except ValueError as e:
        return JSONResponse(status_code=422, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"內部錯誤: {e}"})

def get_anniversary_date(death_solar_date: str, years_to_add: int):
    """
    計算周年（如對年、三年）對應的陽曆日期，處理閏月、大小月等邊界情況。
    :param death_solar_date: 歿日（陽曆，格式 YYYY-MM-DD）
    :param years_to_add: 幾周年（如對年=1，三年=2）
    :return: 對應周年的陽曆日期（YYYY-MM-DD）
    """
    try:
        # 1. 取得歿日的農曆資訊
        lunar_obj = get_lunar_info(death_solar_date)
        
        death_lunar_year = lunar_obj.年
        death_lunar_month = lunar_obj.月 # lunar-python 的閏月為負數
        death_lunar_day = lunar_obj.日

        # 如果是閏月，計算時視為正常月份
        abs_lunar_month = abs(death_lunar_month)

        # 2. 查詢目標年份的閏月資訊
        target_year = death_lunar_year + years_to_add

        # 判斷平閏年
        # is_leap = (target_year % 4 == 0 and target_year % 100 != 0) or (target_year % 400 == 0)

        target_lunar_month = abs_lunar_month

        # 3. 產生新的農曆日期物件
        final_lunar_obj = Lunar.fromYmd(target_year, target_lunar_month, death_lunar_day)
        
        # 4. 轉換回陽曆並回傳
        return final_lunar_obj.getSolar().toYmd()
    except Exception as e:
        raise ValueError(f"周年日期計算失敗: {e}")

def lunar_str_to_digits(lunar_str: str) -> str:
    """
    將農曆日期字串（如「二〇二五年五月初六」）轉為純數字（如「2025-05-06」）。
    只保留年月日的數字部分。
    """
    cn_num_map = {
        "〇": "0", "零": "0", "一": "1", "二": "2", "三": "3", "四": "4", "五": "5",
        "六": "6", "七": "7", "八": "8", "九": "9"
    }
    cn_month_day_map = {
        "正": "1", "十": "10", "冬": "11", "臘": "12",
        "廿": "20", "卅": "30"
    }

    year_str = ""
    month_str = ""
    day_str = ""

    # 年
    year_match = re.search(r"^(.*?)年", lunar_str)
    if year_match:
        for char_cn in year_match.group(1):
            year_str += cn_num_map.get(char_cn, "")

    # 月
    month_match = re.search(r"年(閏)?(.*?)月", lunar_str)
    if month_match:
        raw_month_cn = month_match.group(2)
        if raw_month_cn in cn_month_day_map:
            month_str = cn_month_day_map[raw_month_cn]
        else:
            month_str = cn_num_map.get(raw_month_cn, "")
        if month_str and len(month_str) == 1:
            month_str = "0" + month_str


    # 日
    day_match = re.search(r"月(.+)", lunar_str)
    if day_match:
        raw_day_cn = day_match.group(1).replace("日", "").strip()
        if not raw_day_cn:
            day_str = ""
        elif raw_day_cn == "初十":
            day_str = "10"
        elif raw_day_cn.startswith("初"):
            day_str = "0" + cn_num_map.get(raw_day_cn[1], "") if len(raw_day_cn) == 2 and raw_day_cn[1] in cn_num_map else ""
        elif raw_day_cn == "十":
            day_str = "10"
        elif raw_day_cn == "廿" or raw_day_cn == "二十":
            day_str = "20"
        elif raw_day_cn == "卅" or raw_day_cn == "三十":
            day_str = "30"
        elif raw_day_cn.startswith("卅"):
            day_str = "3" + cn_num_map.get(raw_day_cn[1], "") if len(raw_day_cn) == 2 and raw_day_cn[1] in cn_num_map else ""
        elif raw_day_cn.startswith("廿"):
            day_str = "2" + cn_num_map.get(raw_day_cn[1], "") if len(raw_day_cn) == 2 and raw_day_cn[1] in cn_num_map else ""
        elif raw_day_cn.startswith("十"):
            day_str = "1" + cn_num_map.get(raw_day_cn[1], "") if len(raw_day_cn) == 2 and raw_day_cn[1] in cn_num_map else ""
        else:
            day_str = cn_num_map.get(raw_day_cn, "")
            if day_str and len(day_str) == 1:
                day_str = "0" + day_str
            elif not day_str:
                day_str = ""
    else:
        day_str = ""

    return f"{year_str}-{month_str}-{day_str}"
