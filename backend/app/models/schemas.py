from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class UserRole(str, Enum):
    customer = "customer"
    worker = "worker"
    admin = "admin"


class TaskStatus(str, Enum):
    open = "open"
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class ApplicationStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    withdrawn = "withdrawn"


class BookingStatus(str, Enum):
    pending_payment = "pending_payment"
    paid = "paid"
    in_progress = "in_progress"
    completed = "completed"
    disputed = "disputed"
    refunded = "refunded"


class VerificationStatus(str, Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"


# Auth
class SignupRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=1)


class SignupResponse(BaseModel):
    user_id: UUID
    message: str = "Account created successfully"


# Profile
class ProfileUpdate(BaseModel):
    full_name: str | None = None
    role: UserRole | None = None
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    avatar_url: str | None = None

    model_config = {"extra": "ignore"}


class ProfileResponse(BaseModel):
    id: UUID
    role: UserRole
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    avatar_url: str | None = None
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    has_worker_profile: bool = False
    worker_verified: bool = False
    created_at: datetime


# Worker
class WorkerOnboard(BaseModel):
    bio: str
    skills: list[str] = Field(default_factory=list)
    hourly_rate: int | None = None
    availability: dict | None = None


class WorkerUpdate(BaseModel):
    bio: str | None = None
    skills: list[str] | None = None
    hourly_rate: int | None = None
    availability: dict | None = None
    id_doc_url: str | None = None


class WorkerProfileResponse(BaseModel):
    id: UUID
    bio: str | None = None
    skills: list[str] = []
    hourly_rate: int | None = None
    verification_status: VerificationStatus
    id_doc_url: str | None = None
    availability: dict | None = None
    rating_avg: float = 0
    rating_count: int = 0


class WorkerVerificationUpdate(BaseModel):
    verification_status: VerificationStatus


class AdminStatsResponse(BaseModel):
    total_users: int
    total_customers: int
    total_workers: int
    pending_verifications: int
    verified_workers: int
    total_tasks: int
    total_bookings: int
    completed_bookings: int
    platform_revenue: int


class AdminUserResponse(BaseModel):
    id: UUID
    role: UserRole
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    city: str | None = None
    created_at: datetime


class AdminWorkerResponse(BaseModel):
    id: UUID
    bio: str | None = None
    skills: list[str] = []
    hourly_rate: int | None = None
    verification_status: VerificationStatus
    id_doc_url: str | None = None
    availability: dict | None = None
    rating_avg: float = 0
    rating_count: int = 0
    created_at: datetime | None = None
    profile: ProfileResponse | None = None


class PlatformConfigUpdate(BaseModel):
    key: str
    value: str


# Category
class CategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    icon: str | None = None


# Task
class TaskCreate(BaseModel):
    category_id: UUID
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10)
    address: str
    city: str
    latitude: float | None = None
    longitude: float | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    scheduled_at: datetime | None = None
    duration_hours: float | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: TaskStatus | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    scheduled_at: datetime | None = None


class TaskResponse(BaseModel):
    id: UUID
    customer_id: UUID
    category_id: UUID
    title: str
    description: str
    address: str
    city: str
    latitude: float | None = None
    longitude: float | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    scheduled_at: datetime | None = None
    duration_hours: float | None = None
    status: TaskStatus
    created_at: datetime
    category: CategoryResponse | None = None
    application_count: int = 0


# Application
class ApplicationCreate(BaseModel):
    proposed_price: int = Field(gt=0)
    message: str | None = None


class ApplicationUpdate(BaseModel):
    status: ApplicationStatus | None = None


class ApplicationResponse(BaseModel):
    id: UUID
    task_id: UUID
    worker_id: UUID
    proposed_price: int
    message: str | None = None
    status: ApplicationStatus
    created_at: datetime
    worker: ProfileResponse | None = None


# Booking
class BookingCreate(BaseModel):
    application_id: UUID


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingResponse(BaseModel):
    id: UUID
    task_id: UUID
    application_id: UUID
    customer_id: UUID
    worker_id: UUID
    agreed_price: int
    platform_fee: int
    worker_payout: int
    total_charge: int
    status: BookingStatus
    created_at: datetime
    task: TaskResponse | None = None


# Payment
class PaymentOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str = "INR"
    key_id: str


# Review
class ReviewCreate(BaseModel):
    booking_id: UUID
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class ReviewResponse(BaseModel):
    id: UUID
    booking_id: UUID
    reviewer_id: UUID
    reviewee_id: UUID
    rating: int
    comment: str | None = None
    created_at: datetime