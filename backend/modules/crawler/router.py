import os
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from datetime import datetime, timedelta

router = APIRouter()

def parse_kaohsiung_schedule(raw_text):
    import re
    from collections import defaultdict

    result = defaultdict(list)
    date_pattern = re.compile(r"(\d{3})年(\d{2})月(\d{2})日")
    time_pattern = re.compile(r"(\d{2}:\d{2})")
    current_date = None

    for line in raw_text.splitlines():
        date_match = date_pattern.search(line)
        if date_match:
            year = int(date_match.group(1)) + 1911
            month = int(date_match.group(2))
            day = int(date_match.group(3))
            current_date = f"{year:04d}-{month:02d}-{day:02d}"
            continue
        if not current_date:
            continue
        # Skip headers and footers
        if "火化開" in line or "火化名冊" in line or "本日火化數量" in line or "亡者姓名" in line or "■" in line:
            continue
        # Find all time slots in the line
        times = list(time_pattern.finditer(line))
        if not times:
            continue
        # For each time slot, count names until next time slot or end of line
        for idx, match in enumerate(times):
            time_str = match.group(1)
            start = match.end()
            end = times[idx + 1].start() if idx + 1 < len(times) else len(line)
            names_str = line[start:end].strip()
            names = [n for n in names_str.split() if n]
            if len(names) < 7:
                result[current_date].append(time_str)
    # Convert defaultdict to dict
    return dict(result)

def parse_taoyuan_schedule(raw_text):
    import re
    from collections import defaultdict

    result = defaultdict(list)
    date_pattern = re.compile(r"(\d{3})/(\d{1,2})/(\d{1,2})")
    gregorian_date = None
    time_row_pattern = re.compile(r"^(\d{2})時")
    time_map = {"09": "09:00", "11": "11:00", "13": "13:00", "15": "15:00", "17": "17:00"}

    lines = raw_text.splitlines()
    for idx, line in enumerate(lines):
        # Find date line
        date_match = date_pattern.search(line)
        if date_match and "(" in line:
            year = int(date_match.group(1)) + 1911
            month = int(date_match.group(2))
            day = int(date_match.group(3))
            gregorian_date = f"{year:04d}-{month:02d}-{day:02d}"
            continue
        if not gregorian_date:
            continue
        # Find time row
        time_match = time_row_pattern.match(line.strip())
        if time_match:
            hour = time_match.group(1)
            time_str = time_map.get(hour)
            if not time_str:
                continue
            # Check the next 8 lines for 火爐一~八
            available = False
            for offset in range(1, 9):
                if idx + offset < len(lines):
                    slot = lines[idx + offset].strip()
                    if not slot or slot == "停爐維修":
                        available = True
            if available:
                result[gregorian_date].append(time_str)
    return dict(result)

"""查詢高雄市火化場各時段可預約火化時段。"""
@router.get("/crawl_kaohsiung_info", response_class=JSONResponse)
def crawl_ks_info(start_date: str = Query(default="2025-06-16"), end_date: str = Query(default="2025-06-18")):
    
    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    end_dt = datetime.strptime(end_date, "%Y-%m-%d")

    delta_days = (end_dt - start_dt).days + 1
    url = f"https://mort.kcg.gov.tw/04/P04S03A-view.aspx?mp=Fmok&Day={start_dt.year - 1911}{start_dt.strftime('%m%d')}&Days={delta_days}"
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=chrome_options)
    try:
        driver.get(url)
        driver.implicitly_wait(5)

        body = driver.find_element(By.TAG_NAME, "body")
        text = body.text
        structured = parse_kaohsiung_schedule(text)
        return JSONResponse(content={
            "url": url,
            "availability": structured
        })
    finally:
        driver.quit()

"""查詢桃園市火化場各時段可預約火化時段。"""
@router.get("/crawl_taoyuan_info", response_class=JSONResponse)
def crawl_ty_info(start_date: str = Query(default="2025-06-16"), end_date: str = Query(default="2025-06-18")):
    """
    Query Taoyuan funeral info by date range (max 12 days per query).
    If the range exceeds 12 days, split into multiple queries and aggregate results.
    """

    url = "https://taoyuanfuneral.tycg.gov.tw/Qdata/taoyuan-page4.aspx"
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    driver_path = os.environ.get("CHROMEDRIVER_PATH", "chromedriver")  # Adjust if needed

    # Parse dates
    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    end_dt = datetime.strptime(end_date, "%Y-%m-%d")
    results = []

    current_start = start_dt
    while current_start <= end_dt:
        current_end = min(current_start + timedelta(days=11), end_dt)
        driver = webdriver.Chrome(options=chrome_options)
        try:
            driver.get(url)
            driver.implicitly_wait(1)
            # Select start date
            select_start = Select(driver.find_element(By.NAME, "DropDownList日期起"))
            start_value = f"{current_start.year}/{current_start.month}/{current_start.day}"
            start_options = [o.get_attribute("value") for o in select_start.options]
            if start_value not in start_options:
                driver.quit()
                results.append({
                    "range": f"{start_value}~{current_end.year}/{current_end.month}/{current_end.day}",
                    "error": f"Start date option {start_value} not found"
                })
                current_start = current_end + timedelta(days=1)
                continue
            select_start.select_by_value(start_value)
            # Select end date
            select_end = Select(driver.find_element(By.NAME, "DropDownList日期迄"))
            end_value = f"{current_end.year}/{current_end.month}/{current_end.day}"
            end_options = [o.get_attribute("value") for o in select_end.options]
            if end_value not in end_options:
                driver.quit()
                results.append({
                    "range": f"{start_value}~{end_value}",
                    "error": f"End date option {end_value} not found"
                })
                current_start = current_end + timedelta(days=1)
                continue
            select_end.select_by_value(end_value)
            # If a submit button is needed, click it here
            try:
                driver.implicitly_wait(1)
            except Exception:
                pass
            body = driver.find_element(By.TAG_NAME, "body")
            text = body.text
            parsed = parse_taoyuan_schedule(text)
            results.append(parsed)
        finally:
            driver.quit()
        current_start = current_end + timedelta(days=1)

    # Merge all parsed dicts in results
    merged = {}
    for d in results:
        for k, v in d.items():
            if k not in merged:
                merged[k] = []
            merged[k].extend(v)
    # Remove duplicates and sort times
    for k in merged:
        merged[k] = sorted(list(set(merged[k])))
    return JSONResponse(content={
        "url": url,
        "availability": merged
    })
