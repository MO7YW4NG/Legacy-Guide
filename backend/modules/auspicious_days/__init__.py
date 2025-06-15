"""
吉日推薦模組
用於根據傳統擇日學規則，推薦適合舉行喪葬儀式的吉日。
"""

from .router import router
from .service import AuspiciousDayService

__all__ = ['router', 'AuspiciousDayService'] 