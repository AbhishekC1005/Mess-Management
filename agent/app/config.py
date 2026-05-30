from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    telegram_bot_token: str = ""
    litellm_api_key: str = ""
    litellm_model_name: str = "gemini/gemini-1.5-flash"
    litellm_base_url: str = ""
    backend_api_url: str = "http://localhost:8080/api"
    backend_api_key: str = "default-agent-key-change-me"
    agent_port: int = 8000
    admin_ids: list = []  # List of Telegram user IDs allowed to use admin commands
    database_url: str = "postgresql://postgres:password@localhost:5432/messmanagement"

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
