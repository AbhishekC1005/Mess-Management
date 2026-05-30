import logging
from datetime import date
from typing import Optional
from telegram import Update, KeyboardButton, ReplyKeyboardMarkup, ReplyKeyboardRemove, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    filters,
    ContextTypes,
)
from app.config import get_settings
from app.services import backend_client
from app.langgraph_agent import process_message
from app.services.database import get_last_active_customer_id

logger = logging.getLogger(__name__)
settings = get_settings()

# In-memory cache: telegram_chat_id -> customer data
_customer_cache: dict = {}


async def get_active_customer(chat_id: int) -> Optional[dict]:
    """Retrieve the active customer for a Telegram Chat ID, resolving multi-tenant accounts."""
    customer = _customer_cache.get(chat_id)
    if not customer:
        try:
            res = await backend_client.find_customer_by_telegram_chat_id(chat_id)
            if res:
                refreshed_list = res if isinstance(res, list) else [res]
                if len(refreshed_list) > 1:
                    customer_ids = [c["id"] for c in refreshed_list]
                    active_id = await get_last_active_customer_id(customer_ids)
                    if active_id:
                        for c in refreshed_list:
                            if c["id"] == active_id:
                                customer = c
                                break
                if not customer:
                    customer = refreshed_list[0]
                _customer_cache[chat_id] = customer
        except Exception as e:
            logger.warning(f"Failed to lookup customer by Telegram Chat ID: {e}")
    return customer


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start — welcome, auto-link or switch session, or ask for phone number."""
    chat_id = update.effective_chat.id
    mess_id = context.args[0] if context.args else None

    # Step 1: Check if the user is already linked to ANY mess
    linked_customers = []
    try:
        res = await backend_client.find_customer_by_telegram_chat_id(chat_id)
        if res:
            linked_customers = res if isinstance(res, list) else [res]
    except Exception as e:
        logger.warning(f"Failed to lookup customer by Telegram Chat ID in start_command: {e}")

    # If they are already linked to some mess:
    if linked_customers:
        # Case A: They started with a specific mess_id parameter
        if mess_id:
            # Check if one of their linked accounts is already for this mess
            target_customer = None
            for c in linked_customers:
                if str(c.get("messId")) == mess_id:
                    target_customer = c
                    break

            if target_customer:
                # Already registered and linked at this mess!
                _customer_cache[chat_id] = target_customer
                await update.message.reply_text(
                    f"🔄 *Welcome back to {target_customer.get('messName', 'the mess')}!* 🎉\n\n"
                    f"Your active session has been switched to *{target_customer['name']}*.\n"
                    f"Plan: {target_customer['plan']}\n"
                    f"Status: {target_customer['status']}\n\n"
                    f"How can I help you today? You can say \"Skip lunch today\" or \"Check my status\".",
                    parse_mode="Markdown",
                    reply_markup=ReplyKeyboardRemove(),
                )
                return
            
            # They are linked to other messes, but not this new one yet.
            # Can we find a registration for this mess using their known phone number?
            phone = linked_customers[0].get("phone")
            if phone:
                try:
                    res = await backend_client.find_customer_by_phone(phone)
                    if res:
                        candidates = res if isinstance(res, list) else [res]
                        new_customer = None
                        for cand in candidates:
                            if str(cand.get("messId")) == mess_id:
                                new_customer = cand
                                break
                        
                        if new_customer:
                            # Automatically link this new mess customer to their chat_id!
                            await backend_client.update_telegram_chat_id(new_customer["id"], chat_id)
                            _customer_cache[chat_id] = new_customer
                            await update.message.reply_text(
                                f"✅ *Subscription linked automatically!* 🎉\n\n"
                                f"Welcome to *{new_customer.get('messName', 'your new mess')}*, *{new_customer['name']}*!\n"
                                f"Plan: {new_customer['plan']}\n"
                                f"Status: {new_customer['status']}\n\n"
                                f"How can I help you today?",
                                parse_mode="Markdown",
                                reply_markup=ReplyKeyboardRemove(),
                            )
                            return
                except Exception as e:
                    logger.error(f"Error auto-linking new mess subscription: {e}")

        # Case B: They started /start without any parameter, but are already linked to some mess
        else:
            customer_ids = [c["id"] for c in linked_customers]
            active_id = await get_last_active_customer_id(customer_ids)
            
            default_customer = None
            if active_id:
                for c in linked_customers:
                    if c["id"] == active_id:
                        default_customer = c
                        break
            if not default_customer:
                default_customer = linked_customers[0]

            _customer_cache[chat_id] = default_customer
            await update.message.reply_text(
                f"👋 *Welcome back, {default_customer['name']}!* 🎉\n\n"
                f"You are connected to *{default_customer.get('messName', 'your mess')}*.\n"
                f"Plan: {default_customer['plan']}\n"
                f"Status: {default_customer['status']}\n\n"
                f"How can I help you today?",
                parse_mode="Markdown",
                reply_markup=ReplyKeyboardRemove(),
            )
            return

    # Step 2: If we reach here, they have NO linked accounts yet.
    if mess_id:
        context.user_data["mess_id"] = mess_id

    keyboard = [[KeyboardButton("📱 Share Phone Number", request_contact=True)]]
    reply_markup = ReplyKeyboardMarkup(keyboard, one_time_keyboard=True, resize_keyboard=True)
    await update.message.reply_text(
        "👋 *Welcome to Mess Management Bot!*\n\n"
        "I can help you skip meals, pause/resume your subscription, and check your status.\n\n"
        "To get started, please share your phone number so I can link your account.",
        parse_mode="Markdown",
        reply_markup=reply_markup,
    )



async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /help — list available commands."""
    await update.message.reply_text(
        "🍽️ *Mess Management Bot — Help*\n\n"
        "Here's what I can do:\n\n"
        "• *Skip a meal* — \"Skip lunch today\" or \"I won't come for dinner\"\n"
        "• *Skip multiple days* — \"Skip lunch for next 3 days\"\n"
        "• *Pause subscription* — \"Pause my subscription\"\n"
        "• *Resume subscription* — \"Resume my meals\"\n"
        "• *Check status* — \"What's my status?\"\n\n"
        "📋 *Commands:*\n"
        "/start — Link your account\n"
        "/status — Quick subscription status\n"
        "/help — Show this help message",
        parse_mode="Markdown",
    )


async def status_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /status — quick subscription check."""
    chat_id = update.effective_chat.id
    customer = await get_active_customer(chat_id)

    if not customer:
        await update.message.reply_text(
            "⚠️ Your account is not linked. Use /start to link your phone number."
        )
        return

    try:
        details = await backend_client.get_subscription_details(customer["id"])
        await update.message.reply_text(
            f"📊 *Your Subscription Status*\n\n"
            f"👤 Name: {details['name']}\n"
            f"🍽️ Plan: {details['plan']}\n"
            f"📌 Status: {details['status']}\n"
            f"🔢 Meals Used: {details['mealsUsed']}/{details['totalMeals']}\n"
            f"⏭️ Skipped: {details['skippedCount']}\n"
            f"💰 Amount Due: ₹{details['amountDue']}",
            parse_mode="Markdown",
        )
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        await update.message.reply_text("❌ Failed to fetch your status. Please try again.")


async def handle_contact(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle shared phone number for account linking."""
    contact = update.message.contact
    phone = contact.phone_number

    # Normalize: remove leading + if present
    if phone.startswith("+"):
        phone = phone[1:]

    # Try multiple formats: with country code, without, etc.
    phone_variants = [phone]
    if phone.startswith("91") and len(phone) > 10:
        phone_variants.append(phone[2:])  # without country code
    if len(phone) == 10:
        phone_variants.append("91" + phone)  # with India code
        phone_variants.append("+91" + phone)

    customers = []
    for p in phone_variants:
        try:
            res = await backend_client.find_customer_by_phone(p)
            if res:
                if isinstance(res, list):
                    customers.extend(res)
                else:
                    customers.append(res)
        except Exception:
            continue

    if not customers:
        await update.message.reply_text(
            "❌ *No account found* with this phone number.\n\n"
            "Please register at the mess first, and make sure your phone number is saved in your profile.",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove(),
        )
        return

    # Select the correct customer matching deep-linked mess_id if available
    customer = None
    target_mess_id = context.user_data.get("mess_id")
    
    if target_mess_id:
        for c in customers:
            if str(c.get("messId")) == target_mess_id:
                customer = c
                break

    # Fallback to first matched customer
    if not customer:
        customer = customers[0]

    # Link telegram chat id
    chat_id = update.effective_chat.id
    try:
        await backend_client.update_telegram_chat_id(customer["id"], chat_id)
    except Exception as e:
        logger.error(f"Failed to link chat ID: {e}")

    _customer_cache[chat_id] = customer

    await update.message.reply_text(
        f"✅ *Account linked successfully!*\n\n"
        f"Welcome, *{customer['name']}*! 🎉\n"
        f"Plan: {customer['plan']}\n"
        f"Status: {customer['status']}\n\n"
        f"You can now send me messages like:\n"
        f"• \"Skip lunch today\"\n"
        f"• \"Pause my subscription\"\n"
        f"• \"What's my status?\"",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove(),
    )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle free-text messages — route through LangGraph agent."""
    chat_id = update.effective_chat.id
    customer = await get_active_customer(chat_id)

    if not customer:
        await update.message.reply_text(
            "⚠️ Your account is not linked yet.\nUse /start to share your phone number and get started."
        )
        return

    # Refresh customer details dynamically to ensure current status/plan
    try:
        res = await backend_client.find_customer_by_phone(customer["phone"])
        if res:
            refreshed_list = res if isinstance(res, list) else [res]
            for c in refreshed_list:
                if c.get("id") == customer.get("id"):
                    customer = c
                    _customer_cache[chat_id] = customer
                    break
    except Exception as e:
        logger.warning(f"Failed to refresh customer details from backend: {e}. Using cached data.")

    user_text = update.message.text
    if not user_text:
        return

    # Show typing indicator
    await context.bot.send_chat_action(chat_id=chat_id, action="typing")

    try:
        response = await process_message(
            user_message=user_text,
            customer_id=customer["id"],
            customer_name=customer["name"],
            plan=customer["plan"],
            status=customer["status"],
        )
        await update.message.reply_text(response, parse_mode="Markdown")
    except Exception as e:
        logger.error(f"Agent processing error: {e}", exc_info=True)
        await update.message.reply_text(
            "❌ Sorry, I couldn't process your request. Please try again."
        )


async def handle_inline_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle inline keyboard button presses."""
    query = update.callback_query
    await query.answer()

    chat_id = query.message.chat_id
    callback_data = query.data

    # Parse callback data: action_customerId or action
    parts = callback_data.split("_")
    action = parts[0]
    customer_id = parts[1] if len(parts) > 1 else None

    try:
        if action == "skip":
            meal_type = parts[1]
            customer_id = parts[2]

            # Get customer
            customer = await get_active_customer(chat_id)
            if customer and customer["id"] != customer_id:
                try:
                    res = await backend_client.find_customer_by_telegram_chat_id(chat_id)
                    if res:
                        refreshed_list = res if isinstance(res, list) else [res]
                        for c in refreshed_list:
                            if c["id"] == customer_id:
                                customer = c
                                _customer_cache[chat_id] = customer
                                break
                except Exception as e:
                    logger.warning(f"Failed to verify callback customer ID: {e}")

            if not customer or customer["id"] != customer_id:
                await query.edit_message_text("⚠️ Session expired. Please use /start to re-link your account.")
                return

            # Skip the meal
            meal_map = {"lunch": "Lunch", "dinner": "Dinner", "both": "Both"}
            meal = meal_map.get(meal_type, "Both")

            result = await backend_client.skip_meal(customer_id, date.today().isoformat(), meal)

            await query.edit_message_text(
                f"✅ *Skipped Successfully!*\n\n"
                f"Meal: {meal}\n"
                f"Date: {date.today().strftime('%B %d, %Y')}\n\n"
                f"Your meal has been marked as skipped. You won't be charged for this meal.",
                parse_mode="Markdown"
            )

        elif action == "pay":
            customer_id = parts[1]

            # Get payment link or show instructions
            await query.edit_message_text(
                f"💳 *Payment Instructions*\n\n"
                f"To clear your dues, please use one of the following methods:\n\n"
                f"1. *UPI:* Send payment to mess@upi\n"
                f"2. *Bank Transfer:* Account details available at reception\n"
                f"3. *Cash:* Pay directly at the mess counter\n\n"
                f"Please mention your name and phone number in the payment reference.",
                parse_mode="Markdown"
            )

        elif action == "details":
            customer_id = parts[1]
            details = await backend_client.get_subscription_details(customer_id)

            await query.edit_message_text(
                f"📊 *Payment Details*\n\n"
                f"Name: {details['name']}\n"
                f"Plan: {details['plan']}\n"
                f"Meals Used: {details['mealsUsed']}/{details['totalMeals']}\n"
                f"Amount Due: ₹{details['amountDue']}\n"
                f"Join Date: {details['joinDate']}",
                parse_mode="Markdown"
            )

        elif action == "renew":
            customer_id = parts[1]

            await query.edit_message_text(
                f"🔄 *Renew Subscription*\n\n"
                f"To renew your subscription, please visit the mess reception or contact:\n"
                f"📞 Phone: +91-XXXXXXXXXX\n"
                f"📧 Email: mess@example.com\n\n"
                f"Subscription renewal options:\n"
                f"• Monthly: ₹XXXX\n"
                f"• Quarterly: ₹XXXX\n"
                f"• Annual: ₹XXXX",
                parse_mode="Markdown"
            )

        elif action == "status":
            customer_id = parts[1]
            details = await backend_client.get_subscription_details(customer_id)

            await query.edit_message_text(
                f"📊 *Your Subscription Status*\n\n"
                f"👤 Name: {details['name']}\n"
                f"🍽️ Plan: {details['plan']}\n"
                f"📌 Status: {details['status']}\n"
                f"🔢 Meals Used: {details['mealsUsed']}/{details['totalMeals']}\n"
                f"⏭️ Skipped: {details['skippedCount']}\n"
                f"💰 Amount Due: ₹{details['amountDue']}",
                parse_mode="Markdown"
            )

        elif action == "feedback":
            # Show feedback form
            keyboard = [
                [
                    InlineKeyboardButton("⭐ Excellent", callback_data=f"rate_5_{customer_id}"),
                    InlineKeyboardButton("👍 Good", callback_data=f"rate_4_{customer_id}")
                ],
                [
                    InlineKeyboardButton("😐 Average", callback_data=f"rate_3_{customer_id}"),
                    InlineKeyboardButton("👎 Poor", callback_data=f"rate_2_{customer_id}")
                ],
                [
                    InlineKeyboardButton("😞 Terrible", callback_data=f"rate_1_{customer_id}")
                ]
            ]

            await query.edit_message_text(
                "📝 *Rate Today's Meal*\n\n"
                "How was your meal today? Please select a rating:",
                parse_mode="Markdown",
                reply_markup=InlineKeyboardMarkup(keyboard)
            )

        elif action == "rate":
            rating = parts[1]
            customer_id = parts[2]

            # Record the feedback
            await backend_client.record_feedback(customer_id, "Both", int(rating))

            rating_text = {
                "5": "⭐ Excellent",
                "4": "👍 Good",
                "3": "😐 Average",
                "2": "👎 Poor",
                "1": "😞 Terrible"
            }.get(rating, "Rated")

            await query.edit_message_text(
                f"✅ *Thank you for your feedback!*\n\n"
                f"Your rating: {rating_text}\n\n"
                f"We appreciate your feedback and will use it to improve our meals!",
                parse_mode="Markdown"
            )

    except Exception as e:
        logger.error(f"Error handling inline button: {e}", exc_info=True)
        await query.edit_message_text("❌ An error occurred. Please try again.")


async def menu_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /menu — show today's menu."""
    chat_id = update.effective_chat.id
    customer = await get_active_customer(chat_id)

    try:
        mess_id = customer.get("messId") if customer else None
        menu = await backend_client.get_today_menu(mess_id=str(mess_id) if mess_id else None)

        keyboard = []
        if customer:
            keyboard = [
                [
                    InlineKeyboardButton("Skip Lunch", callback_data=f"skip_lunch_{customer['id']}"),
                    InlineKeyboardButton("Skip Dinner", callback_data=f"skip_dinner_{customer['id']}")
                ],
                [
                    InlineKeyboardButton("Give Feedback", callback_data=f"feedback_{customer['id']}")
                ]
            ]

        reply_markup = InlineKeyboardMarkup(keyboard) if keyboard else None

        await update.message.reply_text(
            f"🍽️ *Today's Menu*\n\n{menu}\n\n" +
            (f"Use the buttons below for quick actions:" if keyboard else "⚠️ Note: To skip meals or give feedback directly, please link your phone number using /start first."),
            parse_mode="Markdown",
            reply_markup=reply_markup
        )
    except Exception as e:
        logger.error(f"Error fetching menu: {e}")
        await update.message.reply_text("❌ Failed to fetch today's menu. Please try again.")


async def feedback_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /feedback — collect customer feedback."""
    chat_id = update.effective_chat.id
    customer = await get_active_customer(chat_id)

    if not customer:
        await update.message.reply_text(
            "⚠️ Your account is not linked. Use /start to link your phone number."
        )
        return

    keyboard = [
        [
            InlineKeyboardButton("⭐ Excellent", callback_data=f"rate_5_{customer['id']}"),
            InlineKeyboardButton("👍 Good", callback_data=f"rate_4_{customer['id']}")
        ],
        [
            InlineKeyboardButton("😐 Average", callback_data=f"rate_3_{customer['id']}"),
            InlineKeyboardButton("👎 Poor", callback_data=f"rate_2_{customer['id']}")
        ],
        [
            InlineKeyboardButton("😞 Terrible", callback_data=f"rate_1_{customer['id']}")
        ]
    ]

    await update.message.reply_text(
        "📝 *Rate Today's Meal*\n\n"
        "How was your meal today? Please select a rating:",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


async def admin_broadcast_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /broadcast — admin command to broadcast message to all customers."""
    user_id = update.effective_user.id

    # Check if user is admin (you can configure admin IDs in settings)
    admin_ids = settings.admin_ids if hasattr(settings, 'admin_ids') else []
    if admin_ids and user_id not in admin_ids:
        await update.message.reply_text("⚠️ You don't have permission to use this command.")
        return

    if not context.args:
        await update.message.reply_text(
            "Usage: /broadcast <message>\n\n"
            "Example: /broadcast Tomorrow the mess will be closed for maintenance."
        )
        return

    message = " ".join(context.args)

    try:
        result = await backend_client.admin_broadcast(message)
        await update.message.reply_text(
            f"✅ Broadcast sent successfully!\n\n"
            f"Recipients: {result.get('count', 0)} customers"
        )
    except Exception as e:
        logger.error(f"Broadcast failed: {e}")
        await update.message.reply_text("❌ Failed to send broadcast. Please try again.")


async def admin_status_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /admin_status — admin command to look up customer by phone."""
    user_id = update.effective_user.id

    admin_ids = settings.admin_ids if hasattr(settings, 'admin_ids') else []
    if admin_ids and user_id not in admin_ids:
        await update.message.reply_text("⚠️ You don't have permission to use this command.")
        return

    if not context.args:
        await update.message.reply_text(
            "Usage: /admin_status <phone_number>\n\n"
            "Example: /admin_status 9876543210"
        )
        return

    phone = context.args[0]

    try:
        res = await backend_client.find_customer_by_phone(phone)
        if not res:
            raise ValueError("Customer not found")
        refreshed_list = res if isinstance(res, list) else [res]
        customer = refreshed_list[0]
        details = await backend_client.get_subscription_details(customer["id"])

        await update.message.reply_text(
            f"👤 *Customer Details*\n\n"
            f"Name: {details['name']}\n"
            f"Phone: {phone}\n"
            f"Plan: {details['plan']}\n"
            f"Status: {details['status']}\n"
            f"Meals Used: {details['mealsUsed']}/{details['totalMeals']}\n"
            f"Skipped: {details['skippedCount']}\n"
            f"Amount Due: ₹{details['amountDue']}\n"
            f"Join Date: {details['joinDate']}\n"
            f"Telegram Linked: {'Yes' if customer.get('telegramChatId') else 'No'}",
            parse_mode="Markdown"
        )
    except Exception as e:
        logger.error(f"Admin status lookup failed: {e}")
        await update.message.reply_text(f"❌ Customer not found with phone: {phone}")


async def admin_correct_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /admin_correct — admin command to force attendance correction."""
    user_id = update.effective_user.id

    admin_ids = settings.admin_ids if hasattr(settings, 'admin_ids') else []
    if admin_ids and user_id not in admin_ids:
        await update.message.reply_text("⚠️ You don't have permission to use this command.")
        return

    if len(context.args) < 4:
        await update.message.reply_text(
            "Usage: /admin_correct <phone> <date> <meal> <action>\n\n"
            "Example: /admin_correct 9876543210 2024-01-15 Lunch mark_present\n\n"
            "Actions: mark_present, mark_absent, mark_skipped"
        )
        return

    phone = context.args[0]
    target_date = context.args[1]
    meal = context.args[2]
    action = context.args[3]

    try:
        res = await backend_client.find_customer_by_phone(phone)
        if not res:
            raise ValueError("Customer not found")
        refreshed_list = res if isinstance(res, list) else [res]
        customer = refreshed_list[0]
        result = await backend_client.admin_correct_attendance(
            customer["id"], target_date, meal, action
        )

        await update.message.reply_text(
            f"✅ *Attendance Corrected*\n\n"
            f"Customer: {customer['name']}\n"
            f"Date: {target_date}\n"
            f"Meal: {meal}\n"
            f"Action: {action}\n\n"
            f"Status: {result.get('status', 'Success')}",
            parse_mode="Markdown"
        )
    except Exception as e:
        logger.error(f"Admin correction failed: {e}")
        await update.message.reply_text("❌ Failed to correct attendance. Please check the details and try again.")


def create_bot_application() -> Application:
    """Create and configure the Telegram bot application."""
    app = Application.builder().token(settings.telegram_bot_token).build()

    # Command handlers
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("status", status_command))
    app.add_handler(CommandHandler("menu", menu_command))
    app.add_handler(CommandHandler("feedback", feedback_command))

    # Admin commands
    app.add_handler(CommandHandler("broadcast", admin_broadcast_command))
    app.add_handler(CommandHandler("admin_status", admin_status_command))
    app.add_handler(CommandHandler("admin_correct", admin_correct_command))

    # Contact handler (phone sharing)
    app.add_handler(MessageHandler(filters.CONTACT, handle_contact))

    # Inline keyboard button handler
    app.add_handler(CallbackQueryHandler(handle_inline_button))

    # Free-text message handler
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    return app
