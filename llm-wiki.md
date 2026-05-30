# 📚 LLM WIKI — MESS MANAGEMENT SYSTEM
> **Purpose**: This file is the primary context document for any AI coding assistant. Read this first before touching any code. It summarizes the complete architecture, data model, API surface, coding conventions, and current state of the project.  
> **Last Updated**: 2026-05-21  
> **Build Status**: ✅ Backend compiles clean (`mvn clean compile`)

---

## 0. QUICK ORIENTATION

This is a **multi-tenant mess (canteen) management platform** with three main components:

| Component | Stack | Location | Purpose |
|---|---|---|---|
| **Backend** | Spring Boot 3.2.5 / Java 17 / PostgreSQL | `/backend` | REST API, JWT auth, business logic |
| **Frontend** | React 19 + Vite + Tailwind CSS | `/frontend` | Admin web dashboard for mess owners |
| **Agent** | Python 3.11 + LangGraph + Telegram Bot | `/agent` | AI chatbot for diners via Telegram |

**Key Mental Model**:
- A **Mess** = one canteen/dining hall (the tenant unit)
- A **User** = the mess owner (has ROLE_ADMIN, logs in via web dashboard)
- A **Customer** = a diner who subscribes to a mess (interacts via Telegram bot)
- **Multi-tenancy**: All data is partitioned by `mess_id` — owners only see their own mess data

---

## 1. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    MESS MANAGEMENT PLATFORM                  │
├─────────────┬────────────────────────┬───────────────────────┤
│  Frontend   │       Backend          │        Agent           │
│  React+Vite │   Spring Boot REST API │  Python FastAPI +      │
│  Port: 5173 │   Port: 8080 /api      │  Telegram Bot          │
│             │   Context path: /api   │  Port: 8000            │
│             │                        │                        │
│  Admin UI   │   JWT Auth             │  LangGraph + NVIDIA NIM│
│  (owners)   │   Flyway Migrations    │  (meta/llama-3.1-70b)  │
│             │   @Scheduled tasks     │  X-Agent-Key auth      │
└─────────────┴────────────┬───────────┴───────────────────────┘
                           │
                    PostgreSQL (Neon DB)
                    DB: messmanagement
```

**Authentication Flows**:
1. **Web Dashboard** → POST `/api/auth/login` → JWT Bearer token → all subsequent requests
2. **Telegram Agent** → every request uses `X-Agent-Key` header (no JWT needed)

---

## 2. BACKEND — SPRING BOOT API

### 2.1 Package Structure
```
com.messmanagement
├── MessManagementApplication.java    (@SpringBootApplication, @EnableScheduling)
├── config/
│   ├── SecurityConfig.java           (filter chain, public/protected routes, BCrypt)
│   └── CorsConfig.java               (CORS from cors.allowed-origins property)
├── controller/                       (REST controllers — thin layer, delegates to services)
│   ├── AuthController.java
│   ├── CustomerController.java
│   ├── AttendanceController.java
│   ├── DailyMenuController.java
│   ├── DashboardController.java
│   ├── MessSettingsController.java
│   └── AgentController.java          (agent-only endpoints, secured by X-Agent-Key)
├── service/                          (interfaces)
│   ├── impl/                         (implementations — business logic lives here)
│   ├── AgentService.java
│   ├── AttendanceService.java
│   ├── AttendanceSchedulerService.java
│   ├── AuthService.java
│   ├── CustomerService.java
│   ├── DailyMenuService.java
│   ├── DashboardService.java
│   └── MessSettingsService.java
├── repository/                       (Spring Data JPA interfaces)
│   ├── MessRepository.java
│   ├── UserRepository.java
│   ├── CustomerRepository.java
│   ├── AttendanceLogRepository.java
│   ├── DailyMenuRepository.java
│   └── MessSettingsRepository.java
├── entity/                           (JPA entities)
│   ├── Mess.java
│   ├── User.java
│   ├── Customer.java
│   ├── AttendanceLog.java
│   ├── PauseHistory.java
│   ├── DailyMenu.java
│   ├── MessSettings.java
│   └── enums/
│       ├── ActionType.java           (Skipped, Resumed, Paused, Present)
│       ├── CustomerStatus.java       (Active, Paused, Inactive)
│       ├── MealPlan.java             (Lunch, Dinner, Both)
│       └── SourceType.java           (Bot, Manual, System)
├── dto/
│   ├── request/                      (incoming request DTOs with validation annotations)
│   └── response/                     (outgoing response DTOs)
├── mapper/                           (MapStruct mappers)
│   ├── CustomerMapper.java
│   └── AttendanceLogMapper.java
├── security/
│   ├── UserPrincipal.java            (custom UserDetails — stores messId in security context)
│   ├── SecurityUtils.java            (static getCurrentMessId() — used by all services)
│   ├── UserDetailsServiceImpl.java   (loads UserPrincipal from DB)
│   ├── JwtTokenProvider.java         (generate/validate JWT)
│   ├── JwtAuthenticationFilter.java  (OncePerRequestFilter — sets SecurityContext)
│   ├── JwtAuthenticationEntryPoint.java (401 JSON responses)
│   └── AgentApiKeyFilter.java        (X-Agent-Key validation for /agent/** routes)
└── exception/
    ├── ResourceNotFoundException.java (→ HTTP 404)
    ├── BadRequestException.java       (→ HTTP 400)
    └── GlobalExceptionHandler.java    (@RestControllerAdvice)
```

### 2.2 Application Configuration (application.yml)

| Property | Default / Env Var |
|---|---|
| Server port | `${PORT:8080}` |
| Context path | `/api` |
| DB URL | `${DB_URL:jdbc:postgresql://localhost:5432/messmanagement}` |
| JPA ddl-auto | `validate` (**Flyway manages schema — NEVER change to create/update**) |
| JWT secret | `${JWT_SECRET:...}` |
| JWT expiry | `${JWT_EXPIRATION:86400000}` (24h in ms) |
| CORS origins | `${CORS_ORIGINS:http://localhost:5173}` |
| Agent API key | `${AGENT_API_KEY:default-agent-key-change-me}` |
| HikariCP max pool | 10 (dev) / 20 (prod) |
| Flyway location | `classpath:db/migration` |

### 2.3 Security Architecture

```
Request Flow:
  HTTP Request
    → AgentApiKeyFilter (if /agent/** → validate X-Agent-Key header)
    → JwtAuthenticationFilter (if JWT → validate and populate SecurityContext with UserPrincipal)
    → SecurityConfig rules (public vs protected routes)
    → Controller
    → Service (calls SecurityUtils.getCurrentMessId() for tenant scoping)
```

**Public routes** (no auth required):
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/swagger-ui/**`
- `GET /api/v3/api-docs/**`
- `GET /api/actuator/**`
- `GET|POST /api/agent/**` (protected by API key instead of JWT)
- All `OPTIONS` requests

**All other routes**: Require valid JWT Bearer token

### 2.4 Multi-Tenancy Pattern (CRITICAL)

This is the **most important architectural pattern** to understand:

```java
// 1. After JWT auth, SecurityContext holds UserPrincipal which carries messId
// 2. Every service calls this to scope queries:
UUID messId = SecurityUtils.getCurrentMessId();

// 3. All repository queries filter by messId:
customerRepository.findAllByMessId(messId, pageable);
attendanceLogRepository.findAllByMessIdOrderByDateDesc(messId, pageable);
```

**Rule**: NEVER call repository methods that return data without a `messId` filter in web-facing services (CustomerService, AttendanceService, DashboardService, DailyMenuService, MessSettingsService). Agent-facing services (AgentService) receive `messId` as explicit parameters.

### 2.5 Complete REST API Reference

All endpoints are prefixed with `/api`.

#### Auth Endpoints (Public)
| Method | Path | Body | Response | Notes |
|---|---|---|---|---|
| POST | `/auth/login` | `{username, password}` | `JwtResponse` | Returns JWT + messId |
| POST | `/auth/register` | `{username, email, password, messName, location, address}` | `JwtResponse` | Atomically creates Mess + MessSettings + User(ROLE_ADMIN) |

**JwtResponse fields**: `token`, `type("Bearer")`, `id`, `username`, `email`, `roles[]`, `messId`

#### Customer Endpoints (JWT required)
| Method | Path | Notes |
|---|---|---|
| GET | `/customers?page=&size=` | Paginated, scoped to current mess |
| GET | `/customers/{id}` | Includes pause history |
| POST | `/customers` | Creates + associates with current mess |
| PUT | `/customers/{id}` | Must belong to current mess |
| DELETE | `/customers/{id}` | Must belong to current mess |
| PATCH | `/customers/{id}/status?status=` | Active/Paused/Inactive |
| POST | `/customers/{id}/pause?endDate=` | Creates PauseHistory record |
| POST | `/customers/{id}/resume` | Closes latest PauseHistory |
| GET | `/customers/count-by-status?status=` | Returns count |

#### Attendance Endpoints (JWT required)
| Method | Path | Notes |
|---|---|---|
| GET | `/attendance?page=&size=` | Scoped to current mess |
| GET | `/attendance/customer/{customerId}` | Customer must belong to current mess |
| POST | `/attendance` | `{date, customerId, meal, action, source}` |
| GET | `/attendance/today/skipped` | Count for today in current mess |
| GET | `/attendance/today/attended` | Count for today in current mess |

#### Other Dashboard/Menu/Settings Endpoints (JWT required)
| Method | Path | Notes |
|---|---|---|
| GET | `/dashboard/stats` | `{totalCustomers, mealsToday, skippedToday, pausedCustomers}` |
| GET | `/dashboard/recent-activity?limit=` | List of AttendanceLogResponse |
| GET | `/menu?date=YYYY-MM-DD` | Defaults to today; scoped to current mess |
| PUT | `/menu` | `{date, lunchMenu, dinnerMenu}` — upserts |
| GET | `/settings` | Mess cutoff times, timezone, auto-mark flag |
| PUT | `/settings` | Updates all settings fields |

#### Agent Endpoints (X-Agent-Key header required)
| Method | Path | Notes |
|---|---|---|
| GET | `/agent/customer/by-phone?phone=` | Returns **List** of profiles across all messes |
| GET | `/agent/customer/by-telegram-chat-id?telegramChatId=` | Returns **List** of profiles across all messes |
| POST | `/agent/attendance/skip` | `{customerId, date, meal}` |
| POST | `/agent/attendance/bulk-skip` | `{customerId, startDate, endDate, meal}` |
| POST | `/agent/customer/{id}/pause` | Sets status=Paused, creates PauseHistory |
| POST | `/agent/customer/{id}/resume` | Sets status=Active, closes PauseHistory |
| PATCH | `/agent/customer/{id}/telegram-chat-id?telegramChatId=` | Links Telegram account |
| GET | `/agent/customer/{id}/subscription` | Full subscription details with pause history |
| GET | `/agent/menu/today?messId=` | Formatted menu string |
| GET | `/agent/settings?messId=` | Cutoff times and timezone |
| GET | `/agent/customers` | Returns all customers with linked Telegram accounts |
| GET | `/agent/customers/due-payments` | Returns active customers with outstanding dues |
| GET | `/agent/customers/near-expiry?days=` | Returns customers nearing subscription end |
| POST | `/agent/feedback` | `{customerId, meal, rating, comment}` — records meal feedback |
| POST | `/agent/admin/broadcast` | `{message}` — returns active customer count for broadcast |
| POST | `/agent/admin/correct-attendance` | `{customerId, date, meal, action}` — forces attendance correction |

### 2.6 Database Schema

All tables use UUID primary keys (`gen_random_uuid()`). Managed exclusively by Flyway.

```sql
-- TENANT TABLE (central)
messes (id UUID PK, name, location, address TEXT, created_at, updated_at)

-- OWNER ACCOUNTS
users (id UUID PK, username UNIQUE, email UNIQUE, password, mess_id FK→messes, created_at, updated_at)
user_roles (user_id FK→users, role VARCHAR, PK(user_id,role))

-- DINERS (multi-mess: one person can subscribe to multiple messes)
customers (id UUID PK, name, plan [Lunch/Dinner/Both], status [Active/Paused/Inactive],
           meals_used INT, total_meals INT, amount_due DECIMAL(10,2),
           join_date DATE, skipped_count INT, phone VARCHAR(20), telegram_chat_id BIGINT,
           mess_id FK→messes, created_at, updated_at,
           UNIQUE(mess_id, phone))   ← same phone can subscribe to different messes

-- PAUSE TRACKING
pause_history (id UUID PK, customer_id FK→customers, start_date DATE, end_date DATE nullable, created_at)

-- ATTENDANCE
attendance_logs (id UUID PK, date DATE, customer_id FK→customers, customer_name VARCHAR,
                 meal [Lunch/Dinner/Both], action [Skipped/Resumed/Paused/Present],
                 source [Bot/Manual/System], mess_id FK→messes, created_at)

-- DAILY MENUS (per-mess)
daily_menu (id UUID PK, date DATE, lunch_menu TEXT, dinner_menu TEXT,
            mess_id FK→messes, created_at, updated_at,
            UNIQUE(mess_id, date))

-- MESS CONFIGURATION
mess_settings (id UUID PK, lunch_cutoff_time TIME, dinner_cutoff_time TIME,
               auto_mark_enabled BOOLEAN, timezone VARCHAR(50),
               mess_id FK→messes UNIQUE, updated_at)
```

**Flyway Migration History**:
- `V1` — Creates core tables (users, customers, attendance_logs, pause_history)
- `V2` — Seeds default admin user (admin/admin123)
- `V3` — Adds phone/telegram fields to customers, creates mess_settings
- `V4` — Creates daily_menu table
- `V5` — Creates messes table, adds mess_id FK to all tables (multi-tenant migration, backfills default mess)

### 2.7 JPA Entity Relationships

```
Mess (1) ──────────────────────── (N) User          [mess.id → users.mess_id]
Mess (1) ──────────────────────── (N) Customer      [mess.id → customers.mess_id]
Mess (1) ──────────────────────── (N) AttendanceLog [mess.id → attendance_logs.mess_id]
Mess (1) ──────────────────────── (N) DailyMenu     [mess.id → daily_menu.mess_id]
Mess (1) ──────────────────────── (1) MessSettings  [mess.id → mess_settings.mess_id UNIQUE]
Customer (1) ─────────────────── (N) PauseHistory   [customer.id → pause_history.customer_id]
Customer (1) ─────────────────── (N) AttendanceLog  [customer.id → attendance_logs.customer_id]
```

All `@ManyToOne` relationships use `FetchType.LAZY`. `PauseHistory` uses `CascadeType.ALL` + `orphanRemoval=true`.

### 2.8 Scheduled Tasks

`AttendanceSchedulerServiceImpl` runs every 60 seconds (`@Scheduled(fixedRate=60000)`):
1. Loads all `MessSettings` from DB
2. For each mess, checks if `LocalTime.now(zone)` matches lunch or dinner cutoff (within same minute)
3. If match: loads all active customers for that mess, filters by meal plan, creates `Present` attendance logs for those who haven't yet been marked

**Important**: The scheduler bypasses `SecurityUtils` (no security context in scheduled tasks). It gets `messId` directly from `MessSettings.getMess().getId()`.

### 2.9 DTOs Reference

**RegisterRequest**: `username`, `email`, `password`, `messName`, `location`, `address`, `registrationPasscode`  
**LoginRequest**: `username`, `password`  
**CustomerRequest**: `name`, `plan`, `status`, `totalMeals`, `amountDue`, `joinDate`, `phone`  
**AttendanceLogRequest**: `date`, `customerId`, `meal`, `action`, `source`  
**DailyMenuRequest**: `date`, `lunchMenu`, `dinnerMenu`  
**MessSettingsRequest**: `lunchCutoffTime`, `dinnerCutoffTime`, `autoMarkEnabled`, `timezone`  
**AgentSkipRequest**: `customerId`, `date`, `meal`  
**AgentBulkSkipRequest**: `customerId`, `startDate`, `endDate`, `meal`  
**AgentCustomerResponse**: `id`, `name`, `plan`, `status`, `mealsUsed`, `totalMeals`, `amountDue`, `joinDate`, `skippedCount`, `phone`, `telegramChatId`, `messId`, `messName`

---

## 3. FRONTEND — REACT WEB DASHBOARD

### 3.1 Tech Stack
- **React 19** + **TypeScript** (strict mode)
- **Vite 8** — build tool
- **Tailwind CSS 3.4** — styling with CSS custom properties for theming
- **react-router-dom 7** — client-side routing
- **Axios 1.15** — HTTP client with JWT interceptors
- **lucide-react** — icons

### 3.2 File Structure
```
frontend/src/
├── main.tsx              (entry: StrictMode + BrowserRouter + AuthProvider)
├── App.tsx               (routing + auth guard + ProtectedLayout with Sidebar)
├── index.css             (Tailwind imports + CSS custom properties for light/dark theme)
├── api/
│   ├── axios.ts          (Axios instance, base URL from VITE_API_URL, JWT interceptor, 401 redirect)
│   ├── auth.ts           (login/register API + interfaces: LoginRequest, RegisterRequest, JwtResponse)
│   ├── customers.ts      (CRUD + pause/resume/status APIs + PageResponse<T> interface)
│   ├── attendance.ts     (log/query attendance APIs)
│   ├── dashboard.ts      (stats + recent activity)
│   ├── menu.ts           (get/save daily menu)
│   ├── settings.ts       (get/update mess settings)
│   └── index.ts          (barrel re-export)
├── hooks/
│   └── useAuth.tsx       (AuthContext + localStorage persistence: token, user(JwtResponse), login(), logout(), isAuthenticated)
├── types/
│   └── index.ts          (TypeScript interfaces mirroring backend DTOs)
├── pages/
│   ├── Login.tsx         (login + register form with mess details; isLogin toggle)
│   ├── Dashboard.tsx     (stats cards + meal breakdown by Lunch/Dinner)
│   ├── Customers.tsx     (paginated table + add form + CustomerDrawer)
│   ├── Attendance.tsx    (log viewer with date/meal/action filters)
│   ├── Menu.tsx          (date navigation + lunch/dinner text editors)
│   └── Settings.tsx      (cutoff times + toggle + timezone selector)
└── components/
    ├── Sidebar.tsx       (collapsible nav 64px→240px, dark/light toggle, logout)
    ├── CustomerDrawer.tsx (right panel: customer actions, financials, pause history)
    ├── MealColumn.tsx    (dashboard meal summary card)
    ├── StatCard.tsx      (metric display card with hover glow)
    └── StatusBadge.tsx   (colored status pill: Active=green, Paused=amber, Inactive=red)
```

### 3.3 Routing
```
/ → redirect to /dashboard (if authenticated)
/dashboard → Dashboard.tsx
/customers → Customers.tsx
/attendance → Attendance.tsx
/settings → Settings.tsx
/menu → Menu.tsx
```

Not authenticated → renders `<Login />` (no redirect, auth guard wraps all routes)

### 3.4 Auth Flow (Frontend)
1. `useAuth` hook reads `token` and `user` from `localStorage` on mount
2. `axios.ts` request interceptor auto-adds `Authorization: Bearer {token}`
3. `axios.ts` response interceptor catches 401 → clears localStorage → redirects to `/login` (reloads page)
4. `login(data: JwtResponse)` stores token + full user object in state → synced to localStorage via `useEffect`
5. `logout()` clears both

### 3.5 Design System (Tailwind Tokens)

Colors (CSS custom properties, both light and dark themes):

| Token | Light | Dark | Usage |
|---|---|---|---|
| `background` | #FAFAFA | #0A0A0A | Page background |
| `surface` | #FFFFFF | #111111 | Cards, panels |
| `border` | #E5E7EB | #222222 | Borders |
| `primary` | #111827 | #F9FAFB | Main text |
| `secondary` | #6B7280 | #9CA3AF | Secondary text |
| `accent` | #22C55E | #22C55E | Green (active, success) |
| `error` | #EF4444 | #EF4444 | Red (error, skipped) |
| `warning` | #F59E0B | #F59E0B | Amber (paused) |

Custom shadows: `shadow-glow-accent`, `shadow-glow-primary`, `shadow-glow-warning`, `shadow-glow-error`

Custom animation: `animate-fade-in-out` (2s ease-in-out, for confirmation messages)

Font: `"SN Pro"`, `"Google Sans"`, sans-serif (loaded from Google Fonts CDN)

**Coding convention**: Use Tailwind utility classes. Custom CSS only in `index.css`. The sidebar uses `twMerge` (tailwind-merge) + `clsx` for conditional class merging.

---

## 4. AGENT — PYTHON TELEGRAM BOT

### 4.1 Tech Stack
- **FastAPI** — HTTP server (health check + lifecycle management)
- **python-telegram-bot 21.5** — Telegram Bot API
- **LangGraph 0.2** — AI agent graph (stateful, tool-calling)
- **LangChain + ChatNVIDIA** — LLM interface (NVIDIA NIM API)
- **LLM Model**: `meta/llama-3.1-70b-instruct` (temp=0.1, max_tokens=512)
- **httpx** — async HTTP client for backend API calls
- **Pydantic-settings** — config management from `.env`

### 4.2 File Structure
```
agent/
├── app/
│   ├── main.py                    (FastAPI lifespan: starts/stops Telegram bot)
│   ├── config.py                  (Settings from .env via pydantic-settings, @lru_cache singleton)
│   ├── langgraph_agent.py         (AI agent graph: ChatNVIDIA LLM + tools + state machine)
│   ├── telegram_bot.py            (All Telegram handlers: /start, /help, /status, /menu, etc.)
│   ├── models/
│   │   └── schemas.py             (Pydantic models: AgentCustomerResponse, enums, request schemas)
│   ├── services/
│   │   ├── backend_client.py      (HTTP client → Spring Boot /api/agent/* endpoints)
│   │   └── notification_scheduler.py (Background tasks: meal reminders, payment alerts)
│   └── tools/
│       └── customer_tools.py      (LangChain @tool functions for LLM to call)
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── .env                           (⚠️ contains secrets — should be gitignored)
```

### 4.3 Agent Data Flow

```
Diner sends Telegram message
  → telegram_bot.py:handle_message()
    → Refreshes customer data from backend (by telegram_chat_id)
    → Shows typing indicator
    → langgraph_agent.py:process_message(msg, customer_context)
        → ChatNVIDIA LLM (system prompt with customer context + today's date)
            → If tool call needed → customer_tools.py
                → backend_client.py (HTTP + X-Agent-Key)
                    → Spring Boot AgentController
                        → AgentServiceImpl
                            → PostgreSQL
            → Returns natural language response
    → telegram_bot.py sends response to diner
```

### 4.4 Customer Onboarding Flow

```
Diner sends /start
  → Bot asks to share phone number (KeyboardButton with request_contact=True)
  → Diner taps "Share Phone"
  → telegram_bot.py:handle_contact()
    → Normalizes phone (strips +91 prefix, handles 10-digit vs 12-digit)
    → backend_client.find_customer_by_phone(phone) → GET /api/agent/customer/by-phone
    → If found: update_telegram_chat_id(customer_id, chat_id) → links account
    → Caches customer data in _customer_cache[chat_id]
    → If not found: tells user to contact mess owner
```

### 4.5 LangGraph Agent Tools

Registered tools (callable by LLM):

| Tool | Function | Backend Call |
|---|---|---|
| `skip_meal` | Skip meal for today or a date | POST `/agent/attendance/skip` |
| `bulk_skip_meals` | Skip for N days | POST `/agent/attendance/bulk-skip` |
| `pause_subscription` | Pause subscription | POST `/agent/customer/{id}/pause` |
| `resume_subscription` | Resume subscription | POST `/agent/customer/{id}/resume` |
| `check_subscription` | Get full subscription details | GET `/agent/customer/{id}/subscription` |

⚠️ `lookup_customer` is defined in `customer_tools.py` but **NOT registered** in the agent graph — it's dead code.

### 4.6 Telegram Bot Commands

| Command | Auth | Description |
|---|---|---|
| `/start` | Public | Welcome + phone number request |
| `/help` | Public | Lists commands and NL examples |
| `/status` | Customer | Quick subscription status from backend |
| `/menu` | Customer | Today's menu with skip inline button |
| `/feedback` | Customer | Star rating inline keyboard (1-5) |
| `/broadcast` | Admin only | Send message to all customers |
| `/admin_status` | Admin only | Look up customer by phone |
| `/admin_correct` | Admin only | Force attendance correction |

Admin check: `user.id in settings.admin_ids` (configured in `.env`)

### 4.7 In-Memory Cache

```python
_customer_cache: dict = {}  # { telegram_chat_id: customer_data_dict }
```

Cache is populated on phone share (`handle_contact`) and refreshed at start of each `handle_message` call. Cache is **per-process** (lost on restart). This means after a bot restart, users need to interact once before the cache is rebuilt.

### 4.8 Notification Scheduler (`notification_scheduler.py`)

Three background asyncio tasks:

1. **Meal Reminders** — 30 min before lunch/dinner cutoff. Sends menu + inline skip button to all active customers.
2. **Payment Due Alerts** — Daily at 9 AM. Sends to customers with `amountDue > 0`.
3. **Subscription Expiry Warnings** — Daily at 10 AM. Warns customers 1-3 days before plan ends.

Rate limiting: 0.5s delay between Telegram messages.

### 4.9 Backend Client (`backend_client.py`)

All calls use:
- `X-Agent-Key: {BACKEND_API_KEY}` header
- Base URL: `BACKEND_API_URL` (default `http://localhost:8080/api`)
- Timeout: 10 seconds
- Retry: 3 attempts with exponential backoff

⚠️ **Known Issue**: Creates a new `httpx.AsyncClient` per request instead of reusing a connection pool.

---

## 5. RESOLVED ISSUES & TECHNICAL DEBT

| Status | Issue | Location | Resolution Details |
|---|---|---|---|
| ✅ Fixed | `agent/.env` is NOT in `.gitignore` — bot token committed | `.gitignore` | Excluded `agent/.env` and standard Python environments in `.gitignore` |
| ✅ Fixed | Open registration — anyone can become ROLE_ADMIN | `AuthServiceImpl.register()` | Added mandatory `registrationPasscode` field to `RegisterRequest` and verified it in backend and UI against configured property |
| ✅ Fixed | Default admin credentials (admin/admin123) in V2 migration | `V2__insert_admin_user.sql` | Added `V6__secure_default_admin.sql` migration to delete default admin user |
| ✅ Fixed | N+1 query in scheduler — loads all customers, filters in Java | `AttendanceSchedulerServiceImpl` | Implemented high-efficiency single JOIN FETCH query and a `NOT EXISTS` attendance log JPQL query to mark in bulk |
| ✅ Fixed | `backend_client.py` creates new httpx client per request | `backend_client.py` | Refactored client to use a global connection pool with clean lifecycle shutdown triggers in lifespan hook |
| ✅ Fixed | `dashboard/stats` mealsToday calc assumes "Both" plan for all | `DashboardServiceImpl` | Added JPQL query `countExpectedMealsTodayByMessId` to dynamically calculate plan-based expected meals |
| ✅ Fixed | `lookup_customer` tool not registered in agent graph | `langgraph_agent.py` | Fully imported and registered `lookup_customer` into `TOOLS` in LangGraph agent graph |
| ✅ Fixed | `@CrossOrigin("*")` on `AuthController` overrides global CORS | `AuthController.java` | Removed local controller-level `@CrossOrigin` to respect the global configured CORS rules |
| ✅ Fixed | `exc_info()` bug in notification_scheduler.py line 267 | `notification_scheduler.py` | Corrected logging syntax to standard keyword `exc_info=True` |
| ✅ Fixed | Swagger UI exposed in production | `application.yml` | Configured `application-prod.yml` to set `springdoc.swagger-ui.enabled=false` and `springdoc.api-docs.enabled=false` |
| ✅ Fixed | Incomplete agent backend support (broadcast, feedback, due payments, expiry warnings, attendance correction) | `AgentServiceImpl.java`, `AgentController.java`, `AttendanceLogRepository.java` | Fully implemented 6 missing service methods and REST endpoints to support proactive notifications and admin bot commands |
| ✅ Fixed | Minimal/Missing `.gitignore` configuration | `.gitignore` | Created a highly secure and comprehensive root gitignore to prevent leaks of environment properties (`.env`), credentials, build outputs (`target/`), and IDE configurations |

---

## 6. DEVELOPMENT COMMANDS

### Backend
```bash
# Run locally
cd backend && mvn spring-boot:run

# Compile check only
cd backend && mvn clean compile

# Build JAR
cd backend && mvn clean package -DskipTests

# Run with dev profile (SQL logging)
cd backend && SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run
```

### Frontend
```bash
# Dev server (port 5173)
cd frontend && npm run dev

# Build for production
cd frontend && npm run build

# Preview production build
cd frontend && npm run preview
```

### Agent
```bash
# Run locally
cd agent && pip install -r requirements.txt
cd agent && uvicorn app.main:app --reload --port 8000

# Run via Docker
cd agent && docker-compose up --build
```

### Docker (Backend)
```bash
cd backend && docker build -t mess-backend .
docker run -p 8080:8080 --env-file .env mess-backend
```

---

## 7. ENVIRONMENT VARIABLES REFERENCE

### Backend (`.env` or system env)
| Variable | Description | Default |
|---|---|---|
| `DB_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/messmanagement` |
| `DB_USERNAME` | DB username | — |
| `DB_PASSWORD` | DB password | — |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | hardcoded dev key |
| `JWT_EXPIRATION` | Token TTL in ms | `86400000` (24h) |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `http://localhost:5173` |
| `AGENT_API_KEY` | API key for Telegram agent | `default-agent-key-change-me` |
| `PORT` | Server port | `8080` |
| `SPRING_PROFILES_ACTIVE` | Active profile (dev/prod) | `dev` |

### Agent (`agent/.env`)
| Variable | Description |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token |
| `NVIDIA_NIM_API_KEY` | NVIDIA NIM API key |
| `NVIDIA_NIM_MODEL` | LLM model name (`meta/llama-3.1-70b-instruct`) |
| `BACKEND_API_URL` | Spring Boot URL (`http://localhost:8080/api`) |
| `BACKEND_API_KEY` | Must match backend `AGENT_API_KEY` |
| `AGENT_PORT` | FastAPI port (`8000`) |
| `ADMIN_IDS` | Comma-separated Telegram user IDs for admin commands |

### Frontend (`.env` or Vite env)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8080/api` |

---

## 8. CODING CONVENTIONS

### Backend (Java/Spring)
- **Naming**: camelCase for fields/methods, PascalCase for classes
- **Entities**: Use `@Data` (Lombok) with caution — `DailyMenu` correctly uses `@Getter @Setter` to avoid Lombok's `equals/hashCode` issues with JPA. Prefer `@Getter @Setter` for JPA entities.
- **Services**: Always call `SecurityUtils.getCurrentMessId()` at the start of web-facing service methods for tenant scoping
- **Repositories**: Method names must follow Spring Data conventions (e.g., `findAllByMessId`, `countByMessIdAndStatus`)
- **DTOs**: Never expose entities directly. Always map to/from DTOs using MapStruct mappers
- **Error handling**: Throw `ResourceNotFoundException` for 404, `BadRequestException` for 400
- **Transactions**: Service classes have `@Transactional` at class level; read-only methods override with `@Transactional(readOnly = true)`

### Frontend (TypeScript/React)
- **Types**: All API interfaces defined in `src/types/index.ts` and `src/api/*.ts`
- **API calls**: Always use functions from `src/api/` — never use raw fetch/axios in components
- **Auth**: Always use `useAuth()` hook — never access localStorage directly
- **Styling**: Tailwind utilities only. Use `twMerge` + `clsx` for conditional classes in components
- **State**: `useState` for local state, React Context for auth — no Redux/Zustand
- **No placeholder images**: Generate with `generate_image` tool if images are needed

### Agent (Python)
- **Config**: Always use `get_settings()` (cached singleton) — never hardcode values
- **Async**: All bot handlers and backend calls are `async`
- **Error handling**: Catch exceptions in handlers, log with `logger.error(..., exc_info=True)`
- **Phone normalization**: Strip `+91` prefix, handle both 10-digit and 12-digit formats

---

## 9. RECENT CHANGES (v5 Multi-Tenant Migration)

The latest major change was implementing **multi-tenancy**. Here's what changed:

1. **New**: `Mess` entity + `MessRepository`
2. **Modified entities**: All entities now have `@ManyToOne → Mess` (`mess_id` FK)
3. **New security**: `UserPrincipal` (stores `messId`), `SecurityUtils` (extracts `messId` from context)
4. **Modified**: `UserDetailsServiceImpl` returns `UserPrincipal.create(user)` instead of Spring's `User`
5. **Modified**: `JwtResponse` now includes `messId`
6. **Modified**: All repository methods scoped to `messId`
7. **Modified**: All service impls call `SecurityUtils.getCurrentMessId()`
8. **Modified**: `AuthServiceImpl.register()` atomically creates Mess + MessSettings + User
9. **Modified**: `RegisterRequest` DTO now includes `messName`, `location`, `address`
10. **Modified**: `AgentService.findCustomerByPhone()` returns `List<>` (multi-mess support)
11. **Modified**: Agent endpoints `getTodayMenu` and `getSettings` now require `?messId=` query param
12. **Modified**: `Login.tsx` signup form now collects mess details
13. **Modified**: `auth.ts` interfaces updated for new fields
14. **New DB migration**: `V5__multi_tenant_schema.sql` — backfills existing data to default mess

---

## 10. EXTERNAL SERVICES

| Service | Provider | Purpose |
|---|---|---|
| PostgreSQL | Neon DB | Primary database |
| Telegram Bot API | Telegram | Customer-facing chatbot |
| NVIDIA NIM | NVIDIA Cloud | LLM inference (Llama 3.1 70B) |
| Google Fonts | Google | "SN Pro" + "Google Sans" fonts |

---

## 11. SWAGGER / API DOCS

When running locally:
- **Swagger UI**: `http://localhost:8080/api/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/api/v3/api-docs`
- **Health check**: `http://localhost:8080/api/actuator/health`
- **Agent health**: `http://localhost:8000/health`

---

*End of LLM Wiki — Version 1.0*
