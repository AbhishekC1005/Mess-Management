# 🏛️ Mess Management System — Multi-Tenant SaaS Platform

A premium, secure, **multi-tenant SaaS platform** designed to streamline mess (canteen) operations for administrators and provide a seamless, AI-driven scheduling interface for diners (customers).

---

## 🌟 Key Features

* **Multi-Tenant Architecture**: Robust data isolation across multiple mess owners, ensuring complete privacy and security of diner records, menu settings, and transactional data.
* **AI-Powered Diner Scheduling Agent**: Diners interact with a stateful Telegram chatbot driven by **LangGraph** & **NVIDIA NIM (`meta/llama-3.1-70b-instruct`)** to skip meals, pause subscriptions, track balances, and give daily feedback in natural language.
* **Automatic Attendance Scheduler**: Custom background worker marking active diners present after meal cutoff times, minimizing manual entry errors.
* **Modern Operations Dashboard**: A sleek dashboard built on React 19 and Tailwind CSS featuring menu management, financial reports, active user statistics, and billing tracking.

---

## 🏛️ System Architecture

The application is composed of three main microservices:

1. **Frontend Dashboard (`/frontend`)**
   * **Stack**: React 19 + TypeScript + Vite + Tailwind CSS
   * **Purpose**: Used by mess administrators to manage menus, track attendance log tables, modify billing details, and audit operational trends.

2. **Backend REST API (`/backend`)**
   * **Stack**: Spring Boot 3.2.5 + Java 17 + PostgreSQL + Flyway
   * **Purpose**: Manages multi-tenant database context partitions, exposes API endpoints with secure JWT auth (dashboard) and Custom API Keys (agent), and executes core database updates.

3. **AI Chatbot Agent (`/agent`)**
   * **Stack**: Python FastAPI + LangGraph + `python-telegram-bot`
   * **Purpose**: Connects Telegram conversations to the stateful LLM orchestrator to automate menu check-ins and skip queries.

---

## 🚀 Quick Start Guide

### 📋 Prerequisites
* **Java 17 / Maven**
* **Node.js (v18+)**
* **Python 3.10+**
* **PostgreSQL Database Instance**

---

### ⚙️ Installation & Running

#### 1. Backend Service
Configure database properties in `backend/src/main/resources/application.yml`, then compile and run:
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
*App is active on `http://localhost:8080` with Context Path `/api`*

#### 2. Web Admin Dashboard
Install packages and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
*App is active on `http://localhost:5173`*

#### 3. AI Telegram Agent
Install dependencies and launch the FastAPI bot listener:
```bash
cd agent
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*Agent is active on `http://localhost:8000`*

---

## 🔒 Multi-Tenancy Scoping Convention (Developers)

Every web-facing backend service method **must** start with:
```java
UUID messId = SecurityUtils.getCurrentMessId();
```
All repository queries should pass `messId` to preserve strict isolation barriers. Refrain from calling unscoped CRUD operations across web request contexts.

---

*Created & managed by Antigravity AI Engine. Authorized for project distribution.*
