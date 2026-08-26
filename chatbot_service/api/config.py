import os

class Config:
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:4000")
    SERVICE_TOKEN = os.getenv("SERVICE_TOKEN", "")
    STATS_TIMEOUT = float(os.getenv("STATS_TIMEOUT", "10"))
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    URI = os.getenv("DB_URI")
    DB_CONNECT_RETRIES = int(os.getenv("DB_CONNECT_RETRIES", "5"))
    DB_CONNECT_DELAY = float(os.getenv("DB_CONNECT_DELAY", "3"))