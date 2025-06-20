from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import os
import base64
from uuid import uuid4
from PIL import Image, ImageDraw, ImageFont
from .layout_config import URN_LAYOUTS

router = APIRouter()

# 📂 圖片路徑
URN_PHOTO_DIR = "./uploads/urn_photos"  
PORTRAIT_DIR = "./uploads/urn_portraits"
DESIGN_DIR = "./uploads/urn_designs"

os.makedirs(URN_PHOTO_DIR, exist_ok=True)
os.makedirs(PORTRAIT_DIR, exist_ok=True)
os.makedirs(DESIGN_DIR, exist_ok=True)

# ✅ 數字轉國字函式
def num_to_chinese(num_str):
    digits = {
        "0": "〇", "1": "一", "2": "二", "3": "三", "4": "四",
        "5": "五", "6": "六", "7": "七", "8": "八", "9": "九"
    }
    return ''.join(digits.get(ch, ch) for ch in num_str)

# ✅ 處理各種日期格式，並轉成國字
def parse_date_to_chinese(date_str: str) -> str:
    date_str = date_str.strip().replace("/", "-").replace(".", "-")
    parts = date_str.split("-")
    if len(parts) != 3:
        raise ValueError(f"日期格式錯誤，應為 YYYY-MM-DD，但收到：{date_str}")
    return f"{num_to_chinese(parts[0])}年{num_to_chinese(parts[1])}月{num_to_chinese(parts[2])}日"

# ✅ 儲存圖片工具
def save_file(file: UploadFile, target_dir: str, custom_name: str = None, allowed_ext: set = {"jpg", "jpeg", "png"}):
    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in allowed_ext:
        raise HTTPException(status_code=415, detail="不支援的圖片格式")
    safe_name = f"{custom_name}.{ext}" if custom_name else f"{uuid4().hex}.{ext}"
    path = os.path.join(target_dir, safe_name)
    with open(path, "wb") as f:
        f.write(file.file.read())
    return safe_name

# ✅ 產生模擬圖
def generate_design_image(urn_path, portrait_path, name, birth_date, death_date):
    base = Image.open(urn_path).convert("RGBA").resize((800, 800))
    urn_filename = os.path.basename(urn_path).strip().lower()
    layout = URN_LAYOUTS.get(urn_filename)
    if not layout:
        raise ValueError(f"找不到樣式對應的 layout 設定: {urn_filename}")

    draw = ImageDraw.Draw(base)
    font_path = "./uploads/urn_fonts/msjh.ttc"
    font = ImageFont.truetype(font_path, 28)

    # ✅ 遺像轉黑白 + 遮罩
    portrait = Image.open(portrait_path).convert("L").convert("RGBA").resize(
        (layout["portrait"]["size"], layout["portrait"]["size"])
    )
    mask = Image.new("L", portrait.size, 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.ellipse((0, 0, portrait.size[0], portrait.size[1]), fill=255)
    portrait.putalpha(mask)
    base.paste(portrait, (layout["portrait"]["x"], layout["portrait"]["y"]), portrait)

    # ✅ 垂直文字函數
    def draw_vertical(text, x, y, spacing=30):
        for i, ch in enumerate(text):
            draw.text((x, y + i * spacing), ch, fill="gold", font=font)

    # ✅ 國字日期轉換
    try:
        birth_cn = parse_date_to_chinese(birth_date)
        death_cn = parse_date_to_chinese(death_date)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    draw_vertical(f"生於{birth_cn}", layout["left_text_x"], layout["text_top_y"])
    draw_vertical(f"歿於{death_cn}", layout["right_text_x"], layout["text_top_y"])
    draw_vertical(f"{name}靈骨", layout["center_text"]["x"], layout["center_text"]["y"])

    # 將圖片轉換為 base64
    import io
    buffer = io.BytesIO()
    base.save(buffer, format='PNG')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return image_base64

# ✅ 上傳與合成 API
@router.post("/urns", tags=["骨灰罈"])
async def create_urn(
    deceased_name: str = Form(...),
    birth_date: str = Form(...),
    death_date: str = Form(...),
    urn_photo_filename: str = Form(...),
    portrait_photo: UploadFile = File(...)
):
    urn_path = os.path.join(URN_PHOTO_DIR, urn_photo_filename)
    
    if not os.path.exists(urn_path):
        raise HTTPException(status_code=404, detail="骨灰罈樣式圖片不存在")

    portrait_filename = save_file(portrait_photo, PORTRAIT_DIR, custom_name=deceased_name)
    portrait_path = os.path.join(PORTRAIT_DIR, portrait_filename)

    # 生成 base64 圖片
    image_base64 = generate_design_image(
        urn_path=urn_path,
        portrait_path=portrait_path,
        name=deceased_name,
        birth_date=birth_date,
        death_date=death_date
    )

    return JSONResponse({
        "message": "骨灰罈模擬圖已建立",
        "data": {
            "deceased_name": deceased_name,
            "birth_date": birth_date,
            "death_date": death_date,
            "urn_photo_url": f"/static/urn_photos/{urn_photo_filename}",
            "portrait_photo_url": f"/static/urn_portraits/{portrait_filename}",
            "design_image_base64": image_base64
        }
    })

# ✅ 提供骨灰罐樣式清單
@router.get("/urn-templates", tags=["骨灰罈"])
async def list_urn_templates():
    files = os.listdir(URN_PHOTO_DIR)
    image_files = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    return JSONResponse({
        "templates": [
            {
                "filename": f,
                "name": f.rsplit(".", 1)[0],
                "url": f"/static/urn_photos/{f}"
            } for f in image_files
        ]
    })
