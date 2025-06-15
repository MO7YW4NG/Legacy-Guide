from fastapi import FastAPI
from modules.lunar.router import router as lunar_router
# from modules.chat.router import router as chat_router
from modules.auspicious_days.router import router as auspicious_days_router
app = FastAPI(title="LegacyGuide API")

app.include_router(lunar_router, prefix="/api")
# app.include_router(chat_router, prefix="/api")
app.include_router(auspicious_days_router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 