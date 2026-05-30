import httpx
import logging
from typing import Optional, Dict, Any, List
from app.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

BASE_URL = settings.backend_api_url
HEADERS = {
    "X-Agent-Key": settings.backend_api_key,
    "Content-Type": "application/json",
}
TIMEOUT = 10.0


_client: Optional[httpx.AsyncClient] = None


def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(timeout=TIMEOUT)
    return _client


async def close_client():
    global _client
    if _client is not None and not _client.is_closed:
        await _client.aclose()
        _client = None


async def _request(
    method: str, path: str, params: Optional[Dict] = None, json: Optional[Dict] = None
) -> Dict[str, Any]:
    """Make an HTTP request to the Spring Boot backend with retry logic."""
    url = f"{BASE_URL}{path}"
    retries = 3
    client = get_client()

    for attempt in range(retries):
        try:
            resp = await client.request(
                method, url, headers=HEADERS, params=params, json=json
            )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP {e.response.status_code} from {url}: {e.response.text}")
            if attempt == retries - 1:
                raise
        except httpx.RequestError as e:
            logger.error(f"Request error to {url} (attempt {attempt + 1}): {e}")
            if attempt == retries - 1:
                raise
            import asyncio
            await asyncio.sleep(2 ** attempt)

    return {}



async def find_customer_by_phone(phone: str) -> Dict[str, Any]:
    """Look up a customer by phone number."""
    return await _request("GET", "/agent/customer/by-phone", params={"phone": phone})


async def find_customer_by_telegram_chat_id(telegram_chat_id: int) -> List[Dict[str, Any]]:
    """Look up a customer by their Telegram chat ID."""
    return await _request("GET", "/agent/customer/by-telegram-chat-id", params={"telegramChatId": telegram_chat_id})


async def skip_meal(customer_id: str, date: str, meal: str) -> Dict[str, Any]:
    """Skip a specific meal for a given date."""
    return await _request(
        "POST",
        "/agent/attendance/skip",
        json={"customerId": customer_id, "date": date, "meal": meal},
    )


async def bulk_skip_meals(
    customer_id: str, start_date: str, end_date: str, meal: str
) -> List[Dict[str, Any]]:
    """Bulk skip meals for a date range."""
    return await _request(
        "POST",
        "/agent/attendance/bulk-skip",
        json={
            "customerId": customer_id,
            "startDate": start_date,
            "endDate": end_date,
            "meal": meal,
        },
    )


async def pause_subscription(customer_id: str) -> Dict[str, Any]:
    """Pause a customer's subscription."""
    return await _request("POST", f"/agent/customer/{customer_id}/pause")


async def resume_subscription(customer_id: str) -> Dict[str, Any]:
    """Resume a customer's subscription."""
    return await _request("POST", f"/agent/customer/{customer_id}/resume")


async def update_telegram_chat_id(
    customer_id: str, telegram_chat_id: int
) -> Dict[str, Any]:
    """Link a Telegram chat ID to a customer."""
    return await _request(
        "PATCH",
        f"/agent/customer/{customer_id}/telegram-chat-id",
        params={"telegramChatId": telegram_chat_id},
    )


async def get_subscription_details(customer_id: str) -> Dict[str, Any]:
    """Get subscription details for a customer."""
    return await _request("GET", f"/agent/customer/{customer_id}/subscription")


async def get_mess_settings(mess_id: str = None) -> Dict[str, Any]:
    """Get mess settings (cutoff times, etc.)."""
    params = {}
    if mess_id:
        params["messId"] = mess_id
    return await _request("GET", "/agent/settings", params=params)


async def get_all_customers() -> List[Dict[str, Any]]:
    """Get all customers with their Telegram chat IDs."""
    return await _request("GET", "/agent/customers")


async def get_customers_with_due_payments() -> List[Dict[str, Any]]:
    """Get customers with outstanding payment dues."""
    return await _request("GET", "/agent/customers/due-payments")


async def get_customers_near_expiry(days_remaining: int = 3) -> List[Dict[str, Any]]:
    """Get customers whose subscription is expiring soon."""
    return await _request("GET", "/agent/customers/near-expiry", params={"days": days_remaining})


async def get_today_menu(mess_id: str = None) -> str:
    """Get today's menu as a formatted string."""
    params = {}
    if mess_id:
        params["messId"] = mess_id
    result = await _request("GET", "/agent/menu/today", params=params)
    return result.get("menu", "Menu not available")


async def record_feedback(customer_id: str, meal: str, rating: int, comment: Optional[str] = None) -> Dict[str, Any]:
    """Record customer feedback for a meal."""
    return await _request(
        "POST",
        "/agent/feedback",
        json={"customerId": customer_id, "meal": meal, "rating": rating, "comment": comment},
    )


async def admin_broadcast(message: str) -> Dict[str, Any]:
    """Broadcast a message to all customers."""
    return await _request("POST", "/agent/admin/broadcast", json={"message": message})


async def admin_correct_attendance(customer_id: str, date: str, meal: str, action: str) -> Dict[str, Any]:
    """Force correct attendance for a customer."""
    return await _request(
        "POST",
        "/agent/admin/correct-attendance",
        json={"customerId": customer_id, "date": date, "meal": meal, "action": action},
    )
