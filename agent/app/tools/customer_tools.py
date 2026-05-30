import logging
from datetime import date, timedelta
from typing import Optional
from langchain_core.tools import tool
from app.services import backend_client

logger = logging.getLogger(__name__)


@tool
async def lookup_customer(phone: str) -> str:
    """Find a customer by their phone number. Returns customer details if found."""
    try:
        results = await backend_client.find_customer_by_phone(phone)
        if not results:
            return f"No customer found with phone {phone}."
        # Handle both list and single dict responses
        if isinstance(results, dict):
            results = [results]
        summary = []
        for c in results:
            summary.append(
                f"• {c['name']} @ {c.get('messName', 'Mess')}: "
                f"Plan: {c['plan']}, Status: {c['status']}, "
                f"Meals Used: {c['mealsUsed']}/{c['totalMeals']}, "
                f"Skipped: {c['skippedCount']}, ID: {c['id']}"
            )
        return "Customer(s) found:\n" + "\n".join(summary)
    except Exception as e:
        return f"Customer lookup failed: {str(e)}"


@tool
async def skip_meal(customer_id: str, meal: str, target_date: Optional[str] = None) -> str:
    """Skip a specific meal (Lunch, Dinner, or Both) for today or a given date.
    
    Args:
        customer_id: The UUID of the customer
        meal: The meal to skip - Lunch, Dinner, or Both
        target_date: The date to skip in YYYY-MM-DD format. Defaults to today.
    """
    if not target_date:
        target_date = date.today().isoformat()
    try:
        result = await backend_client.skip_meal(customer_id, target_date, meal)
        return f"Successfully skipped {result.get('meal', meal)} on {result.get('date', target_date)} for {result.get('customerName', 'customer')}."
    except Exception as e:
        return f"Failed to skip meal: {str(e)}"


@tool
async def bulk_skip_meals(
    customer_id: str, meal: str, num_days: int, start_date: Optional[str] = None
) -> str:
    """Skip meals for multiple consecutive days.
    
    Args:
        customer_id: The UUID of the customer
        meal: The meal to skip - Lunch, Dinner, or Both
        num_days: Number of days to skip
        start_date: Start date in YYYY-MM-DD format. Defaults to today.
    """
    if not start_date:
        start_date = date.today().isoformat()
    end_date = (date.fromisoformat(start_date) + timedelta(days=num_days - 1)).isoformat()
    try:
        results = await backend_client.bulk_skip_meals(
            customer_id, start_date, end_date, meal
        )
        count = len(results) if isinstance(results, list) else 1
        return f"Successfully skipped {meal} for {count} days from {start_date} to {end_date}."
    except Exception as e:
        return f"Failed to bulk skip meals: {str(e)}"


@tool
async def pause_subscription(customer_id: str) -> str:
    """Pause a customer's mess subscription indefinitely.
    
    Args:
        customer_id: The UUID of the customer
    """
    try:
        result = await backend_client.pause_subscription(customer_id)
        return f"Subscription paused for {result.get('name', 'customer')}. Status is now {result.get('status', 'Paused')}."
    except Exception as e:
        return f"Failed to pause subscription: {str(e)}"


@tool
async def resume_subscription(customer_id: str) -> str:
    """Resume a paused customer's mess subscription.
    
    Args:
        customer_id: The UUID of the customer
    """
    try:
        result = await backend_client.resume_subscription(customer_id)
        return f"Subscription resumed for {result.get('name', 'customer')}. Status is now {result.get('status', 'Active')}."
    except Exception as e:
        return f"Failed to resume subscription: {str(e)}"


@tool
async def check_subscription(customer_id: str) -> str:
    """Check the current subscription status and details of a customer.
    
    Args:
        customer_id: The UUID of the customer
    """
    try:
        r = await backend_client.get_subscription_details(customer_id)
        return (
            f"Name: {r['name']}\n"
            f"Plan: {r['plan']}\n"
            f"Status: {r['status']}\n"
            f"Meals Used: {r['mealsUsed']}/{r['totalMeals']}\n"
            f"Skipped Count: {r['skippedCount']}\n"
            f"Amount Due: ₹{r['amountDue']}\n"
            f"Join Date: {r['joinDate']}"
        )
    except Exception as e:
        return f"Failed to fetch subscription details: {str(e)}"
