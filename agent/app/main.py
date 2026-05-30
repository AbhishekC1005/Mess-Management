import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Body
from telegram import InlineKeyboardButton, InlineKeyboardMarkup
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


@app.post("/agent/menu/broadcast")
async def broadcast_menu_update(payload: dict = Body(...)):
    """Broadcast an updated menu to all active diners registered at the mess."""
    global bot_app
    if not bot_app:
        logger.warning("Telegram bot is not running, skipping broadcast")
        return {"status": "error", "message": "Bot is not running"}

    mess_id = payload.get("messId")
    mess_name = payload.get("messName", "the mess")
    lunch_menu = payload.get("lunchMenu", "").strip()
    dinner_menu = payload.get("dinnerMenu", "").strip()

    if not mess_id:
        return {"status": "error", "message": "Missing messId"}

    # 1. Fetch all customers from the backend
    try:
        from app.services import backend_client
        customers = await backend_client.get_all_customers()
    except Exception as e:
        logger.error(f"Failed to fetch customers for broadcast: {e}")
        return {"status": "error", "message": f"Backend communication error: {str(e)}"}

    # 2. Filter customers by matching messId and Active status
    target_customers = [
        c for c in customers 
        if str(c.get("messId")) == str(mess_id) and c.get("status") == "Active" and c.get("telegramChatId")
    ]

    if not target_customers:
        logger.info(f"No active Telegram subscribers found for mess {mess_id}")
        return {"status": "success", "message": "No active subscribers to notify", "sent_count": 0}

    # 3. Create Telegram update message
    menu_msg = (
        f"📢 *Today's Menu has been updated at {mess_name}!* 🍽️\n\n"
    )
    if lunch_menu:
        menu_msg += f"🍱 *Lunch Menu:*\n{lunch_menu}\n\n"
    if dinner_menu:
        menu_msg += f"🍛 *Dinner Menu:*\n{dinner_menu}\n\n"
    
    menu_msg += "Need to skip a meal today? Click a button below or let me know!"

    # 4. Asynchronously broadcast the messages to each customer
    sent_count = 0
    for customer in target_customers:
        chat_id = customer["telegramChatId"]
        
        # Inline buttons for quick skips
        keyboard = [
            [
                InlineKeyboardButton("Skip Lunch", callback_data=f"skip_lunch_{customer['id']}"),
                InlineKeyboardButton("Skip Dinner", callback_data=f"skip_dinner_{customer['id']}")
            ],
            [
                InlineKeyboardButton("Skip Both", callback_data=f"skip_both_{customer['id']}")
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        try:
            await bot_app.bot.send_message(
                chat_id=chat_id,
                text=menu_msg,
                parse_mode="Markdown",
                reply_markup=reply_markup
            )
            sent_count += 1
            # Rate limit mitigation
            await asyncio.sleep(0.05)
        except Exception as e:
            logger.error(f"Failed to send menu broadcast to {customer['name']} ({chat_id}): {e}")

    logger.info(f"Broadcasted menu update to {sent_count} active customers of mess {mess_id} ({mess_name})")
    return {"status": "success", "sent_count": sent_count}


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
