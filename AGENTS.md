# AGENTS.md — AI Coding Assistant Configuration
# Mess Management System

> **FIRST STEP**: Read `llm-wiki.md` at the project root for the complete system architecture, 
> API reference, database schema, and coding conventions.

## Quick Reference

### Architecture (3 components)
- `/backend` — Spring Boot 3.2.5 / Java 17 REST API (port 8080, context: `/api`)
- `/frontend` — React 19 + Vite + Tailwind CSS (port 5173)
- `/agent` — Python FastAPI + LangGraph + Telegram Bot (port 8000)
- **Database**: PostgreSQL (schema managed by Flyway — NEVER change `ddl-auto`)

### Multi-Tenancy Rule (CRITICAL)
Every web-facing service method MUST start with:
```java
UUID messId = SecurityUtils.getCurrentMessId();
```
Then pass `messId` to all repository queries. See `llm-wiki.md § 2.4` for the full pattern.

### Build Commands
```bash
# Backend compile check
cd backend && mvn clean compile

# Frontend dev server
cd frontend && npm run dev

# Agent dev server
cd agent && uvicorn app.main:app --reload --port 8000
```

### Key Files to Know
| File | Why Important |
|---|---|
| `backend/src/main/resources/db/migration/V5__multi_tenant_schema.sql` | Latest schema (multi-tenant) |
| `backend/.../security/SecurityUtils.java` | Tenant scoping utility |
| `backend/.../security/UserPrincipal.java` | Custom auth principal with messId |
| `backend/.../service/impl/AuthServiceImpl.java` | Registration creates Mess + User atomically |
| `agent/app/langgraph_agent.py` | AI agent graph definition |
| `agent/app/telegram_bot.py` | All Telegram handlers |
| `agent/app/services/backend_client.py` | Agent → Backend HTTP calls |

### Do NOT Do
- ❌ Change `spring.jpa.hibernate.ddl-auto` from `validate`
- ❌ Call unscoped repository methods (without `messId`) in web services
- ❌ Create new Flyway migrations that conflict with V5 schema
- ❌ Use raw fetch/axios in React components — use `src/api/` functions
- ❌ Access localStorage directly — use `useAuth()` hook
- ❌ Add `@CrossOrigin("*")` — global CORS is configured in `CorsConfig.java`
