import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application
from app.config import get_settings
from app.services import backend_client

logger = logging.getLogger(__name__)
settings = get_settings()


class NotificationScheduler:
    """Handles scheduled outbound notifications via Telegram."""

    def __init__(self, bot_app: Application):
        self.bot_app = bot_app
        self._tasks: Dict[str, asyncio.Task] = {}
        self._running = False

    async def start(self):
        """Start the notification scheduler."""
        if self._running:
            logger.warning("Scheduler already running")
            return

        self._running = True
        logger.info("Starting notification scheduler")

        # Schedule payment due alerts (daily at 9 AM)
        self._schedule_payment_alerts()

        # Schedule subscription expiry warnings (daily at 10 AM)
        self._schedule_expiry_warnings()

    async def stop(self):
        """Stop all scheduled tasks."""
        self._running = False
        for name, task in self._tasks.items():
            task.cancel()
            logger.info(f"Cancelled task: {name}")
        self._tasks.clear()

    def _schedule_payment_alerts(self):
        """Schedule daily payment due alerts."""
        async def payment_alert_task():
            while self._running:
                try:
                    # Schedule for 9 AM daily
                    alert_time = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
                    if alert_time < datetime.now():
                        alert_time += timedelta(days=1)

                    wait_seconds = (alert_time - datetime.now()).total_seconds()
                    await asyncio.sleep(max(0, wait_seconds))

                    if self._running:
                        await self._send_payment_alerts()

                except Exception as e:
                    logger.error(f"Error in payment alert task: {e}", exc_info=True)
                    await asyncio.sleep(3600)

        task = asyncio.create_task(payment_alert_task())
        self._tasks["payment_alerts"] = task

    def _schedule_expiry_warnings(self):
        """Schedule subscription expiry warnings."""
        async def expiry_warning_task():
            while self._running:
                try:
                    # Schedule for 10 AM daily
                    warning_time = datetime.now().replace(hour=10, minute=0, second=0, microsecond=0)
                    if warning_time < datetime.now():
                        warning_time += timedelta(days=1)

                    wait_seconds = (warning_time - datetime.now()).total_seconds()
                    await asyncio.sleep(max(0, wait_seconds))

                    if self._running:
                        await self._send_expiry_warnings()

                except Exception as e:
                    logger.error(f"Error in expiry warning task: {e}", exc_info=True)
                    await asyncio.sleep(3600)

        task = asyncio.create_task(expiry_warning_task())
        self._tasks["expiry_warnings"] = task

    async def _send_payment_alerts(self):
        """Send payment due alerts to customers with outstanding dues."""
        try:
            customers = await backend_client.get_customers_with_due_payments()

            for customer in customers:
                if customer.get("telegramChatId"):
                    chat_id = customer["telegramChatId"]
                    amount_due = customer.get("amountDue", 0)

                    keyboard = [
                        [
                            InlineKeyboardButton("Pay Now", callback_data=f"pay_{customer['id']}"),
                            InlineKeyboardButton("View Details", callback_data=f"details_{customer['id']}")
                        ]
                    ]

                    message = (
                        f"💰 *Payment Due Reminder*\n\n"
                        f"Hello {customer['name']}!\n\n"
                        f"You have an outstanding payment of *₹{amount_due}*\n\n"
                        f"Please clear your dues to continue enjoying your meals uninterrupted."
                    )

                    try:
                        await self.bot_app.bot.send_message(
                            chat_id=chat_id,
                            text=message,
                            parse_mode="Markdown",
                            reply_markup=InlineKeyboardMarkup(keyboard)
                        )
                        logger.info(f"Sent payment alert to {customer['name']}")
                        await asyncio.sleep(0.5)

                    except Exception as e:
                        logger.error(f"Failed to send payment alert to {customer['name']}: {e}")

        except Exception as e:
            logger.error(f"Error sending payment alerts: {e}", exc_info=True)

    async def _send_expiry_warnings(self):
        """Send subscription expiry warnings."""
        try:
            customers = await backend_client.get_customers_near_expiry(days_remaining=3)

            for customer in customers:
                if customer.get("telegramChatId"):
                    chat_id = customer["telegramChatId"]
                    days_left = customer.get("daysRemaining", 0)

                    keyboard = [
                        [
                            InlineKeyboardButton("Renew Subscription", callback_data=f"renew_{customer['id']}"),
                            InlineKeyboardButton("Check Status", callback_data=f"status_{customer['id']}")
                        ]
                    ]

                    if days_left <= 1:
                        urgency = "🚨 URGENT"
                        warning = "Your subscription expires TOMORROW!"
                    elif days_left == 2:
                        urgency = "⚠️ WARNING"
                        warning = "Your subscription expires in 2 days!"
                    else:
                        urgency = "📌 REMINDER"
                        warning = "Your subscription expires in 3 days!"

                    message = (
                        f"{urgency} *Subscription Expiry Warning*\n\n"
                        f"Hello {customer['name']}!\n\n"
                        f"{warning}\n\n"
                        f"Please renew your subscription to avoid interruption in your meal service."
                    )

                    try:
                        await self.bot_app.bot.send_message(
                            chat_id=chat_id,
                            text=message,
                            parse_mode="Markdown",
                            reply_markup=InlineKeyboardMarkup(keyboard)
                        )
                        logger.info(f"Sent expiry warning to {customer['name']}")
                        await asyncio.sleep(0.5)

                    except Exception as e:
                        logger.error(f"Failed to send expiry warning to {customer['name']}: {e}")

        except Exception as e:
            logger.error(f"Error sending expiry warnings: {e}", exc_info=True)