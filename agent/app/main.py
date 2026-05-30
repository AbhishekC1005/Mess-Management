import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.config import get_settings
from app.telegram_bot import create_bot_application
from app.services.notification_scheduler import NotificationScheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()

bot_app = None
bot_task = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start/stop the Telegram bot alongside FastAPI."""
    global bot_app, bot_task

    if settings.telegram_bot_token:
        bot_app = create_bot_application()
        await bot_app.initialize()
        await bot_app.start()
        # Start polling in background
        bot_task = asyncio.create_task(
            bot_app.updater.start_polling(drop_pending_updates=True)
        )
        logger.info("Telegram bot started polling")
    else:
        logger.warning("TELEGRAM_BOT_TOKEN not set — bot disabled")

    # Initialize DB pool
    from app.services.database import init_db_pool, close_db_pool
    await init_db_pool()

    yield

    # Shutdown
    await close_db_pool()

    from app.services.backend_client import close_client
    await close_client()
    logger.info("Closed backend client connection pool")

    if bot_app:
        await bot_app.updater.stop()
        await bot_app.stop()
        await bot_app.shutdown()
        logger.info("Telegram bot stopped")



app = FastAPI(
    title="Mess Management Agent",
    description="AI Agent service for Mess Management via Telegram",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "bot_running": bot_app is not None,
        "model": settings.nvidia_nim_model,
    }


@app.get("/")
async def root():
    return {"service": "mess-management-agent", "version": "1.0.0"}
