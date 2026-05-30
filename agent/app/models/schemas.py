from pydantic import BaseModel
from typing import Optional
from datetime import date
from enum import Enum


class MealPlan(str, Enum):
    Lunch = "Lunch"
    Dinner = "Dinner"
    Both = "Both"


class CustomerStatus(str, Enum):
    Active = "Active"
    Paused = "Paused"
    Inactive = "Inactive"


class AgentCustomerResponse(BaseModel):
    id: str
    name: str
    plan: MealPlan
    status: CustomerStatus
    mealsUsed: int
    totalMeals: int
    amountDue: float
    joinDate: str
    skippedCount: int
    phone: Optional[str] = None
    telegramChatId: Optional[int] = None


class AttendanceLogResponse(BaseModel):
    id: str
    date: str
    customerId: str
    customerName: str
    meal: MealPlan
    action: str
    source: str
    createdAt: Optional[str] = None


class AgentSkipRequest(BaseModel):
    customerId: str
    date: str
    meal: MealPlan


class AgentBulkSkipRequest(BaseModel):
    customerId: str
    startDate: str
    endDate: str
    meal: MealPlan


class UserIntent(str, Enum):
    skip_meal = "skip_meal"
    bulk_skip = "bulk_skip"
    pause_subscription = "pause_subscription"
    resume_subscription = "resume_subscription"
    check_status = "check_status"
    greeting = "greeting"
    unknown = "unknown"


class ExtractedEntities(BaseModel):
    meal: Optional[MealPlan] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    num_days: Optional[int] = None
