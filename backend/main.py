from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os


from modules.lunar.router import router as lunar_router
# from modules.chat.router import router as chat_router
# from modules.recommend_chat.router import router as recommend_router
from modules.crawler.router import router as crawler_router
from modules.auspicious_days.router import router as auspicious_days_router
from modules.urn.router import router as urn_router


app = FastAPI(title="LegacyGuide API")

UPLOAD_STATIC_DIR = os.path.join(os.path.dirname(__file__), "uploads")
app.mount("/static", StaticFiles(directory=UPLOAD_STATIC_DIR), name="static")
app.mount("/static", StaticFiles(directory="uploads"), name="static")



app.include_router(lunar_router, prefix="/api")
# app.include_router(chat_router, prefix="/api")
# app.include_router(recommend_router, prefix="/api")
app.include_router(crawler_router, prefix="/api")
app.include_router(auspicious_days_router, prefix="/api")
app.include_router(urn_router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
