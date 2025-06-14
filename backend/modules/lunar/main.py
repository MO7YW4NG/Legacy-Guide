from fastapi import FastAPI, Query
from lunar_python import Solar
from fastapi.responses import JSONResponse
from opencc import OpenCC

app = FastAPI()
cc = OpenCC('s2t')  # 簡體轉繁體

@app.get("/api/lunar")
def get_lunar_info(date: str = Query(..., description="格式：YYYY-MM-DD")):
    try:
        solar = Solar.fromYmd(*map(int, date.split("-")))
        lunar = solar.getLunar()

        return {
            "公曆": date,
            "農曆": cc.convert(lunar.toFullString()),
            "節氣": cc.convert(lunar.getJieQi()),
            "宜": [cc.convert(item) for item in lunar.getDayYi()],
            "忌": [cc.convert(item) for item in lunar.getDayJi()],
            "沖煞": cc.convert(lunar.getChongDesc()),
            "干支": {
                "年": cc.convert(lunar.getYearInGanZhi()),
                "月": cc.convert(lunar.getMonthInGanZhi()),
                "日": cc.convert(lunar.getDayInGanZhi())
            },
            "生肖": cc.convert(lunar.getYearShengXiao())
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
