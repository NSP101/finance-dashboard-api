# Finance Data Processing and Access Control System

Full-stack finance dashboard with role-based access control, built as part of a backend developer internship assessment.

---

## Overview

This project implements a complete finance dashboard backend with a React frontend. It supports multiple user roles with different levels of access to financial data, analytics, and system management.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              React Frontend                  │
│         (Vite + Recharts + Axios)            │
│           http://localhost:5173              │
└─────────────────┬───────────────────────────┘
                  │ HTTP / REST API
┌─────────────────▼───────────────────────────┐
│            Express.js Backend                │
│         Node.js + SQLite + JWT               │
│           http://localhost:3000              │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │  Routes  │ │ Services │ │ Middleware  │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
│                    │                         │
│  ┌─────────────────▼───────────────────────┐ │
│  │           SQLite Database               │ │
│  │     users + transactions tables        │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Start the Backend

```bash
cd user-management-api
npm install
npm run dev
```

Backend: `http://localhost:3000`
API Docs: `http://localhost:3000/api-docs`

### 2. Start the Frontend

```bash
cd user-management-api/finance-dashboard
npm install
npm run dev
```

Frontend: `http://localhost:5173`

---

## Test Credentials

Run the seed script to populate the database with sample users and transactions:

```bash
cd user-management-api
node seed.js
```

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | Admin@123 |
| Analyst | analyst@test.com | Analyst@123 |
| Viewer | viewer@test.com | Viewer@123 |

---

## Key Features

- JWT authentication with role-based access control
- Three roles: viewer, analyst, admin with enforced permissions
- Financial records CRUD with filtering, sorting, pagination
- Dashboard analytics: summary, category totals, monthly and weekly trends
- Soft delete for both users and transactions
- React frontend with charts, toast notifications, CSV export
- Swagger API documentation

---

## Documentation

- [Backend README](./user-management-api/README.md) — API endpoints, data models, setup
- [Frontend README](./user-management-api/finance-dashboard/README.md) — UI features, component structure
- [Swagger UI](http://localhost:3000/api-docs) — Interactive API documentation
