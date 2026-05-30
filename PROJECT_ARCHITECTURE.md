# 🏛️ MESS MANAGEMENT SYSTEM — SYSTEM ARCHITECTURE DOCUMENT

> **Document Type**: Comprehensive Architectural Blueprints & Data Model  
> **Target Audience**: Software Engineers, System Architects, and Maintainers  
> **System Version**: 2.0 (Fully Multi-Tenant)  
> **Last Updated**: May 30, 2026

---

## 1. HIGH-LEVEL COMPONENT ARCHITECTURE

The Mess Management System is a premium, secure, **multi-tenant SaaS platform** designed to streamline mess (canteen) operations for administrators and provide a seamless, AI-driven scheduling interface for diners (customers).

The system consists of three core components communicating over secure network protocols:
1. **Frontend Dashboard (`/frontend`)**: A React 19 + TypeScript + Vite web application styled with Tailwind CSS, used by mess owners (admins) to manage menus, view financial reports, audit attendance, and configure settings.
2. **Backend API Service (`/backend`)**: A Spring Boot 3.2.5 REST API running on Java 17, exposing data endpoints, enforcing security boundaries (JWT & API Keys), managing multi-tenant database partitions, and running cron-like scheduler tasks.
3. **AI Chatbot Agent (`/agent`)**: A Python FastAPI backend running a stateful **LangGraph** chatbot connected to Telegram and powered by the **NVIDIA NIM** platform (`meta/llama-3.1-70b-instruct`) for natural language scheduling.

### Component Relationship Diagram

```mermaid
graph TD
    classDef frontend fill:#4F46E5,stroke:#312E81,stroke-width:2px,color:#FFF;
    classDef backend fill:#10B981,stroke:#065F46,stroke-width:2px,color:#FFF;
    classDef agent fill:#F59E0B,stroke:#78350F,stroke-width:2px,color:#FFF;
    classDef db fill:#EF4444,stroke:#7F1D1D,stroke-width:2px,color:#FFF;

    subgraph ClientLayer [Client / Interaction Layer]
        Owner[Web Admin Dashboard <br> React 19 + Vite]:::frontend
        Diner[Telegram Mobile App <br> Diner Chatbot]:::agent
    end

    subgraph AgentLayer [Agent / AI Layer]
        TelegramBot[Telegram Bot Handler <br> python-telegram-bot]:::agent
        FastAPI[FastAPI Server <br> Port 8000]:::agent
        LangGraph[LangGraph State Machine]:::agent
        LLM[NVIDIA NIM LLM <br> Llama 3.1 70B]:::agent
    end

    subgraph BackendLayer [Backend REST API Layer]
        SpringBoot[Spring Boot REST API <br> Port 8080 /api]:::backend
        Security[Security Context <br> JWT / X-Agent-Key Filter]:::backend
        Scheduler[Attendance Scheduler <br> @Scheduled Task]:::backend
    end

    subgraph DatabaseLayer [Data Store]
        PostgreSQL[(PostgreSQL Neon DB)]:::db
    end

    %% Communication Links
    Owner -->|1. REST Calls + JWT Bearer| Security
    Diner -->|2. Chat Messages| TelegramBot
    TelegramBot <-->|3. Process State & History| FastAPI
    FastAPI <-->|4. LLM Agents & Tools| LangGraph
    LangGraph <-->|5. Chat Completion API| LLM
    LangGraph -->|6. Scoped Admin Actions <br> httpx + X-Agent-Key| Security
    Security --> SpringBoot
    SpringBoot <-->|7. Scoped JPA Queries| PostgreSQL
    Scheduler -->|8. Cutoff Auto-Marking| PostgreSQL
```

---

## 2. DATABASE SCHEMA & ENTITY RELATIONSHIPS

The database is built on **PostgreSQL** and managed exclusively using **Flyway Migrations** (enforced using Hibernate `validate` strategy). Every primary key is a UUID generated on the database side using `gen_random_uuid()`. 

To prevent cross-tenant data leaks, all transactional tables feature a foreign key reference to `messes.id` (`mess_id`), creating logical partition structures.

### Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    MESSES {
        uuid id PK
        varchar name
        varchar location
        text address
        timestamp created_at
        timestamp updated_at
    }
    USERS {
        uuid id PK
        varchar username
        varchar email
        varchar password
        uuid mess_id FK
        timestamp created_at
        timestamp updated_at
    }
    USER_ROLES {
        uuid user_id PK_FK
        varchar role PK
    }
    CUSTOMERS {
        uuid id PK
        varchar name
        varchar plan "MealPlan: Lunch, Dinner, Both"
        varchar status "CustomerStatus: Active, Paused, Inactive"
        int meals_used
        int total_meals
        decimal amount_due
        date join_date
        int skipped_count
        varchar phone
        bigint telegram_chat_id
        uuid mess_id FK
        timestamp created_at
        timestamp updated_at
    }
    PAUSE_HISTORY {
        uuid id PK
        uuid customer_id FK
        date start_date
        date end_date
        timestamp created_at
    }
    ATTENDANCE_LOGS {
        uuid id PK
        date date
        uuid customer_id FK
        varchar customer_name
        varchar meal "MealPlan: Lunch, Dinner, Both"
        varchar action "ActionType: Skipped, Resumed, Paused, Present"
        varchar source "SourceType: Bot, Manual, System"
        uuid mess_id FK
        timestamp created_at
    }
    DAILY_MENU {
        uuid id PK
        date date
        text lunch_menu
        text dinner_menu
        uuid mess_id FK
        timestamp created_at
        timestamp updated_at
    }
    MESS_SETTINGS {
        uuid id PK
        time lunch_cutoff_time
        time dinner_cutoff_time
        boolean auto_mark_enabled
        varchar timezone
        uuid mess_id FK
        timestamp updated_at
    }

    MESSES ||--o{ USERS : "owns-accounts"
    MESSES ||--o{ CUSTOMERS : "manages-diners"
    MESSES ||--o{ ATTENDANCE_LOGS : "logs-activity"
    MESSES ||--o{ DAILY_MENU : "serves-menus"
    MESSES ||--|| MESS_SETTINGS : "configures"
    USERS ||--|{ USER_ROLES : "assigned"
    CUSTOMERS ||--o{ PAUSE_HISTORY : "tracks-pauses"
    CUSTOMERS ||--o{ ATTENDANCE_LOGS : "registers-activity"
```

### Table Definitions & SQL Schema

#### 2.1 `messes` (Tenant Table)
This is the root table. Every individual canteen or subscription unit registered on the platform is a tenant.
```sql
CREATE TABLE messes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.2 `users` (Owner Accounts)
Holds credential data for mess administrators. Linked 1:1 or N:1 to a specific mess.
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    mess_id UUID NOT NULL REFERENCES messes(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role)
);
```

#### 2.3 `customers` (Diners / Subscriptions)
Represents diners subscribed to a mess. A customer with the same phone number can subscribe to different messes (e.g. multi-mess), which is why the uniqueness constraint is on `(mess_id, phone)`.
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(20) NOT NULL, -- Enum: 'LUNCH', 'DINNER', 'BOTH'
    status VARCHAR(20) NOT NULL, -- Enum: 'ACTIVE', 'PAUSED', 'INACTIVE'
    meals_used INT DEFAULT 0,
    total_meals INT NOT NULL,
    amount_due DECIMAL(10,2) DEFAULT 0.00,
    join_date DATE NOT NULL,
    skipped_count INT DEFAULT 0,
    phone VARCHAR(20) NOT NULL,
    telegram_chat_id BIGINT,
    mess_id UUID NOT NULL REFERENCES messes(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_mess_phone UNIQUE (mess_id, phone)
);
```

#### 2.4 `pause_history` (Diner Plan Pauses)
Maintains historical pause tracking. When a customer pauses their subscription, a row is added. The pause remains active until `end_date` is populated.
```sql
CREATE TABLE pause_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE, -- NULL indicates the pause is active indefinitely
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.5 `attendance_logs` (Daily Logs)
Every meal check-in, auto-marked attendance, skip request, or administrative modification records a row here.
```sql
CREATE TABLE attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    meal VARCHAR(20) NOT NULL, -- Enum: 'LUNCH', 'DINNER', 'BOTH'
    action VARCHAR(20) NOT NULL, -- Enum: 'PRESENT', 'SKIPPED', 'PAUSED', 'RESUMED'
    source VARCHAR(20) NOT NULL, -- Enum: 'BOT', 'MANUAL', 'SYSTEM'
    mess_id UUID NOT NULL REFERENCES messes(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.6 `daily_menu` (Canteen Menu per Day)
Stores the daily menu for each mess. Scoped via unique constraint `(mess_id, date)`.
```sql
CREATE TABLE daily_menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    lunch_menu TEXT,
    dinner_menu TEXT,
    mess_id UUID NOT NULL REFERENCES messes(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_mess_date UNIQUE (mess_id, date)
);
```

#### 2.7 `mess_settings` (Tenant Configuration)
Each mess has exact cutoffs, a distinct location-based timezone, and flags governing system behavior (e.g. automatic marking).
```sql
CREATE TABLE mess_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lunch_cutoff_time TIME NOT NULL,
    dinner_cutoff_time TIME NOT NULL,
    auto_mark_enabled BOOLEAN DEFAULT TRUE,
    timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
    mess_id UUID UNIQUE NOT NULL REFERENCES messes(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. USER INTERACTION FLOWS

### 3.1 Customer (Diner) Telegram Onboarding & Account Linking
A customer must verify their identity and register their Telegram chat channel with the backend database so the AI agent knows which database records to retrieve.

```mermaid
sequenceDiagram
    autonumber
    actor Diner as Diner (Telegram)
    participant Bot as Telegram Bot API
    participant Agent as Agent Service (FastAPI)
    participant Backend as Spring Boot REST API
    participant DB as PostgreSQL DB

    Diner->>Bot: /start
    Bot->>Diner: Welcome! Please share your phone number to link your mess subscription.
    Diner->>Bot: Clicks physical "Share Phone Number" button
    Bot->>Agent: handle_contact(phone_number, chat_id)
    Note over Agent: Normalizes phone number<br/>(strips +91 prefix, handles country codes)
    Agent->>Backend: GET /api/agent/customer/by-phone?phone=... (Header: X-Agent-Key)
    Backend->>DB: Query customer record matching phone
    DB-->>Backend: Returns active Customer list (multi-mess support)
    Backend-->>Agent: JSON Response with Customer Profile details
    
    alt Customer Not Found
        Agent-->>Bot: Send registration error
        Bot-->>Diner: Phone number not found in any active Mess database. Contact your mess owner.
    else Customer Linked
        Agent->>Backend: PATCH /api/agent/customer/{id}/telegram-chat-id?telegramChatId=...
        Backend->>DB: Update customer's telegram_chat_id column
        DB-->>Backend: Success
        Backend-->>Agent: Updated Profile Details
        Agent->>Agent: Cache customer profile under chat_id
        Agent-->>Bot: Success confirmation payload
        Bot-->>Diner: Verified! Your account is linked to "Gourmet Mess" under a "Both" (Lunch + Dinner) meal plan.
    end
```

### 3.2 Diner Skipping a Meal (Natural Language AI Agent Flow)
One of the primary user interactions is letting diners adjust their daily attendance simply by talking. They can text standard sentences to their bot.

```mermaid
sequenceDiagram
    autonumber
    actor Diner as Diner (Telegram)
    participant Bot as Telegram Bot API
    participant Agent as Agent Service (FastAPI)
    participant LLM as ChatNVIDIA (Llama 3.1 70B)
    participant Backend as Spring Boot REST API
    participant DB as PostgreSQL DB

    Diner->>Bot: "I want to cancel dinner tonight"
    Bot->>Agent: handle_message("I want to cancel dinner tonight", chat_id)
    Agent->>Agent: Look up and refresh cached customer profile by chat_id
    Agent->>LLM: process_message(prompt, customer_context, today's date)
    Note over LLM: LLM parses message and context<br/>Determines intent: skip a meal<br/>Extracts arguments: date = today, meal = DINNER
    LLM-->>Agent: Returns tool execution instruction: skip_meal(customerId, date, meal)
    
    Agent->>Backend: POST /api/agent/attendance/skip {customerId, date, meal} (Header: X-Agent-Key)
    
    rect rgb(240, 240, 255)
        Note over Backend: 1. Resolves Customer's MessSettings<br/>2. Checks if dinner cutoff time has passed for today's date<br/>(If passed -> abort and throw 400 Bad Request)
        Backend->>DB: Check if AttendanceLog already exists for today/dinner
        Backend->>DB: Write AttendanceLog (Action=SKIPPED, Source=BOT, Meal=DINNER)
        Backend->>DB: Increment skipped_count, Decrement meals_used (refunding credit)
        DB-->>Backend: Changes Committed
    end
    
    Backend-->>Agent: JSON success status & updated customer stats
    Agent->>LLM: Send function response details back to context
    LLM-->>Agent: Generate natural, polite final chat response
    Agent-->>Bot: Send Telegram API sendMessage request
    Bot-->>Diner: Understood. I've cancelled your dinner for tonight. Your remaining balance has been credited.
```

---

## 4. INTERNAL PROCESSING & PLATFORM MECHANICS

### 4.1 Strict Multi-Tenancy Scoping (Security Architecture)
To support multi-tenancy, the Spring Boot backend isolates tenant contexts dynamically at the thread level during request processing. No admin can access, view, or modify the customers, attendance logs, settings, or menus of another mess.

```
Incoming Request Flow (Admin Dashboard Route):
  HTTP Request (e.g. GET /api/customers)
    ├── Headers: Authorization: Bearer <JWT_Token>
    │
    ├── [JwtAuthenticationFilter]
    │     ├── Extracts & validates JWT
    │     ├── Loads UserPrincipal from database
    │     │     └── Extracted property: UserPrincipal.messId
    │     └── Populates SecurityContextHolder with UserPrincipal authentication
    │
    ├── [SecurityConfig] (Authorization checks)
    │
    ├── [CustomerController]
    │     └── Delegates to CustomerService.findAllCustomers()
    │
    └── [CustomerServiceImpl] (Core Isolation Pattern)
          ├── 1. Fetches current tenant scope:
          │      UUID messId = SecurityUtils.getCurrentMessId();
          │
          ├── 2. Applies filter directly to DB query:
          │      Page<Customer> customers = customerRepository.findAllByMessId(messId, pageable);
          │
          └── 3. Maps to DTOs and returns isolated records
```

> [!CRITICAL]
> All REST controller endpoints (except Agent endpoints protected by api key) rely on this architecture. It is an absolute convention that **no unscoped database queries** are performed inside standard service implementations.

### 4.2 Auto-Mark Attendance Background Scheduler
To avoid manually checking in hundreds of active diners every day, the backend runs a high-performance background worker that automatically marks diners as `PRESENT` once their specific mess’s cutoff time passes (if they haven’t proactively logged a `SKIPPED` entry).

```mermaid
sequenceDiagram
    autonumber
    participant Scheduler as Spring Boot Timer (@Scheduled)
    participant DB as PostgreSQL DB
    
    Note over Scheduler: Fires every 60 seconds
    Scheduler->>DB: Load all active MessSettings (JOIN FETCH mess object)
    DB-->>Scheduler: List of active MessSettings
    
    loop For each MessSettings
        Note over Scheduler: Convert current time to the settings' timezone
        alt Time matches LUNCH Cutoff (within the minute)
            Note over Scheduler: Query active customers on LUNCH or BOTH plan<br/>excluding those with an existing SKIPPED or PAUSED status for today
            Scheduler->>DB: Execute BULK INSERT into attendance_logs (Action=PRESENT, Source=SYSTEM)
            DB-->>Scheduler: Commit transactions
        else Time matches DINNER Cutoff (within the minute)
            Note over Scheduler: Query active customers on DINNER or BOTH plan<br/>excluding those with an existing SKIPPED or PAUSED status for today
            Scheduler->>DB: Execute BULK INSERT into attendance_logs (Action=PRESENT, Source=SYSTEM)
            DB-->>Scheduler: Commit transactions
        end
    end
```

### 4.3 AI Chatbot Agent Architecture (LangGraph State Machine)
The FastAPI application coordinates all AI activity. Rather than using simple, linear chains, it builds a graph state structure using **LangGraph** to process incoming text. It supports fallback mechanisms, tool executions, and state preservation.

```mermaid
stateDiagram-v2
    [*] --> Start
    Start --> CheckOnboarding : Validate chat_id registration
    
    state CheckOnboarding {
        [*] --> CacheCheck
        CacheCheck --> ReturnContext : telegram_chat_id active
        CacheCheck --> PhonePrompt : telegram_chat_id NOT active
    }
    
    PhonePrompt --> WaitContact : Ask user to share number via button
    WaitContact --> [*] : Terminate state (awaits contact event)
    
    ReturnContext --> LLMNode : Start conversation loop
    
    state LLMNode {
        [*] --> ChatNVIDIA : Send text + context + past chat memory
        ChatNVIDIA --> ToolRoute : Decide if action is needed
        ToolRoute --> TextResponse : No action needed
        ToolRoute --> FunctionCall : Tool execution needed
    }
    
    FunctionCall --> ExecuteTool
    
    state ExecuteTool {
        [*] --> ResolveTool
        ResolveTool --> skip_meal : skip_meal()
        ResolveTool --> bulk_skip_meals : bulk_skip_meals()
        ResolveTool --> pause_subscription : pause_subscription()
        ResolveTool --> resume_subscription : resume_subscription()
        ResolveTool --> check_subscription : check_subscription()
    }
    
    skip_meal --> ToolFeedback
    bulk_skip_meals --> ToolFeedback
    pause_subscription --> ToolFeedback
    resume_subscription --> ToolFeedback
    check_subscription --> ToolFeedback
    
    ToolFeedback --> LLMNode : Append output to agent history loop
    TextResponse --> FormatReply : LLM outputs natural reply
    FormatReply --> [*] : Send Telegram message & finish
```

---

## 5. API ENDPOINTS REFERENCE (SYSTEM ROUTING)

All backend endpoints are prefixed with `/api`. Dynamic request mapping is divided into admin-facing (JWT Auth) and agent-facing (X-Agent-Key Auth).

### 5.1 Admin REST Endpoints (Requires JWT Auth Header)

| Entity Module | Method | Path | Request Body | Purpose |
|---|---|---|---|---|
| **Authentication** | POST | `/auth/login` | `LoginRequest` | Logs in user, returns JWT + `messId` |
| | POST | `/auth/register` | `RegisterRequest` | Registers new Mess, Settings, and User |
| **Customers** | GET | `/customers` | *Query params* | Fetches paginated customers for tenant |
| | POST | `/customers` | `CustomerRequest` | Creates a customer for the active mess |
| | PUT | `/customers/{id}` | `CustomerRequest` | Modifies customer parameters |
| | DELETE | `/customers/{id}` | *None* | Removes customer (soft delete cascade) |
| | POST | `/customers/{id}/pause` | `?endDate=YYYY-MM-DD` | Manually starts a plan pause |
| | POST | `/customers/{id}/resume`| *None* | Ends the plan pause, resuming status |
| **Attendance** | GET | `/attendance` | *Query params* | Fetches recent attendance logs |
| | POST | `/attendance` | `AttendanceRequest`| Manually records a custom attendance action |
| **Daily Menu** | GET | `/menu` | `?date=YYYY-MM-DD` | Returns the active menu for a specific date |
| | PUT | `/menu` | `DailyMenuRequest` | Creates or updates (upserts) menu lists |
| **Mess Settings** | GET | `/settings` | *None* | Fetches current cutoff and timezone configurations |
| | PUT | `/settings` | `SettingsRequest` | Updates the mess settings configuration |

### 5.2 Agent REST Endpoints (Requires `X-Agent-Key` Header)

These endpoints are used exclusively by the Python Agent service to interact with the backend database.

| Method | Path | Payload Parameters | Target Action |
|---|---|---|---|
| GET | `/agent/customer/by-phone` | `?phone=...` | Resolves diner profiles across messes by phone number |
| GET | `/agent/customer/by-telegram-chat-id` | `?telegramChatId=...` | Resolves active profiles by verified Telegram chat identifier |
| PATCH| `/agent/customer/{id}/telegram-chat-id` | `?telegramChatId=...` | Saves and links a diner's verified Telegram ID |
| POST | `/agent/attendance/skip` | `AgentSkipRequest` | Processes a customer's specific meal skip request |
| POST | `/agent/attendance/bulk-skip` | `AgentBulkSkipRequest` | Processes multi-day meal skips (bulk duration refund) |
| POST | `/agent/customer/{id}/pause` | *None* | Sets status to Paused and adds a PauseHistory item |
| POST | `/agent/customer/{id}/resume` | *None* | Sets status to Active and closes PauseHistory |
| GET | `/agent/customer/{id}/subscription` | *None* | Fetches full registration context with billing & history |
| GET | `/agent/menu/today` | `?messId=...` | Returns formatted lunch & dinner menu details for the mess |
| GET | `/agent/settings` | `?messId=...` | Fetches specific cutoff profiles |
| GET | `/agent/customers/due-payments` | *None* | Returns active customers with outstanding bills |
| GET | `/agent/customers/near-expiry` | `?days=...` | Returns list of subscribers whose plan expires soon |
| POST | `/agent/feedback` | `FeedbackRequest` | Persists star ratings and feedback for mess meals |
| POST | `/agent/admin/broadcast` | `BroadcastRequest` | Dispatches system broadcasts to active subscribers |

---

## 6. PROACTIVE NOTIFICATION SCHEDULER SYSTEMS

Aside from handling customer incoming messages, the Agent Service operates continuous **asyncio scheduling processes** running concurrently inside FastAPI. These background threads ensure diners remain informed without needing manual admin intervention.

### 6.1 Daily Reminders & Alerts Architecture
```
[Agent Scheduler Loop]
  ├── Every 60s check
  │
  ├── 1. 30 Minutes Before Cutoff Time (Meal Reminder)
  │     ├── Loads all active customers from Backend
  │     ├── Checks today's DailyMenu from Backend
  │     └── Sends message to each Telegram ID:
  │           "Today's Menu: <Menu Details>. Tap below to skip if you won't attend!"
  │           └── [Inline Telegram Button: ❌ Skip This Meal]
  │
  ├── 2. Daily at 09:00 AM (Payment Due Alert)
  │     ├── Calls GET /api/agent/customers/due-payments
  │     └── Loops through diners with amount_due > 0:
  │           "Dear <Name>, a gentle reminder that your mess dues of ₹<Amount> are pending."
  │
  └── 3. Daily at 10:00 AM (Subscription Expiry Alert)
        ├── Calls GET /api/agent/customers/near-expiry?days=3
        └── Notifies users whose total_meals - meals_used is < 3:
              "Your subscription is expiring in <N> meals. Contact owner to renew!"
```

---

## 7. BUILD & DEPLOYMENT ARCHITECTURE

The platform is designed to be fully containerized and easily deployable across cloud providers (e.g. AWS, Render, Docker Environments).

```
[Production Environment]
  │
  ├── [Ingress / Reverse Proxy (NGINX/Cloudflare)]
  │     ├── Routing Rules:
  │     │     ├── /         -> Routes to Frontend static assets (AWS S3/Vercel)
  │     │     ├── /api/**   -> Routes to Backend Application (Port 8080)
  │     │     └── /agent/** -> Routes to Agent Bot Webhook/Process (Port 8000)
  │     └── Handles SSL Termination
  │
  ├── [Frontend Server Instance] (Vite Static Build Hosting)
  │
  ├── [Backend Spring Boot App Instance]
  │     └── Environment:
  │           ├── DB_URL=jdbc:postgresql://<neon-db-url>/messmanagement
  │           ├── AGENT_API_KEY=********
  │           └── JWT_SECRET=********
  │
  ├── [Agent FastAPI & Bot Process Instance]
  │     └── Environment:
  │           ├── TELEGRAM_BOT_TOKEN=********
  │           ├── NVIDIA_NIM_API_KEY=********
  │           ├── BACKEND_API_URL=http://localhost:8080/api
  │           └── BACKEND_API_KEY=********
  │
  └── [PostgreSQL Relational DB] (Neon DB/AWS RDS Serverless)
```

---

*Document Created by Antigravity AI Engine. Authorized for project distribution.*
