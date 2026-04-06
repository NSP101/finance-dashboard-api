# Finance Data Processing and Access Control Backend

A production-ready backend API for a finance dashboard system built with Node.js, Express, and SQLite. Features role-based access control, financial records management, and dashboard analytics.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | SQLite (via sqlite3) |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| API Docs | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Environment | dotenv |

---

## Project Structure

```
user-management-api/
├── app.js                  # Entry point, middleware, route registration
├── .env                    # Environment variables
├── database.sqlite         # SQLite database (auto-created on first run)
├── controllers/
│   ├── userController.js       # Auth and user management handlers
│   ├── transactionController.js # Financial records handlers
│   └── dashboardController.js  # Analytics and summary handlers
├── services/
│   ├── userService.js          # User business logic
│   ├── transactionService.js   # Transaction business logic
│   └── dashboardService.js     # Dashboard aggregation logic
├── middleware/
│   └── authMiddleware.js       # JWT authentication + role guard
├── models/
│   └── db.js                   # SQLite connection and schema setup
├── routes/
│   ├── userRoutes.js           # /api/register, /api/login, /api/users
│   ├── transactionRoutes.js    # /api/transactions
│   └── dashboardRoutes.js      # /api/dashboard
└── finance-dashboard/          # React frontend (see frontend README)
```

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- npm

### Steps

```bash
# 1. Navigate to the backend folder
cd user-management-api

# 2. Install dependencies
npm install

# 3. Seed the database with sample data
node seed.js

# 4. Start the development server
npm run dev
```

- API runs at: `http://localhost:3000`
- Swagger docs (local): `http://localhost:3000/api-docs`
- Swagger docs (live): `https://finance-dashboard-api-g0ja.onrender.com/api-docs`

---

## Environment Variables

```env
PORT=3000
JWT_SECRET=finance_dashboard_super_secret_key
```

---

## Data Models

### Users Table
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| name | TEXT | Full name |
| email | TEXT | Unique email address |
| password | TEXT | bcrypt hashed password |
| role | TEXT | viewer / analyst / admin |
| status | TEXT | active / inactive |
| created_at | DATETIME | Registration timestamp |

### Transactions Table
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| amount | REAL | Transaction amount (positive) |
| type | TEXT | income / expense |
| category | TEXT | e.g. Salary, Rent, Food |
| date | TEXT | Format: YYYY-MM-DD |
| notes | TEXT | Optional description |
| is_deleted | INTEGER | Soft delete flag (0/1) |
| created_by | INTEGER | Foreign key → users.id |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

---

## Role-Based Access Control

| Action | viewer | analyst | admin |
|--------|--------|---------|-------|
| Register / Login | ✅ | ✅ | ✅ |
| View transactions | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| Filter & sort transactions | ✅ | ✅ | ✅ |
| View dashboard summary | ❌ | ✅ | ✅ |
| View category totals | ❌ | ✅ | ✅ |
| View monthly/weekly trends | ❌ | ✅ | ✅ |
| Create transactions | ❌ | ❌ | ✅ |
| Update transactions | ❌ | ❌ | ✅ |
| Delete transactions | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Change own password | ✅ | ✅ | ✅ |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/register | Register new user | No |
| POST | /api/login | Login, returns JWT | No |
| POST | /api/forgot-password | Request password reset token | No |
| POST | /api/reset-password | Reset password using token | No |
| PUT | /api/profile/password | Change own password | Yes |

### User Management (admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List users (search + pagination) |
| PUT | /api/users/:id | Update role / status |
| DELETE | /api/users/:id | Deactivate user (soft delete) |

### Transactions
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | /api/transactions | Create transaction | admin |
| GET | /api/transactions | List with filters, sort, pagination | all |
| GET | /api/transactions/:id | Get single transaction | all |
| PUT | /api/transactions/:id | Update transaction | admin |
| DELETE | /api/transactions/:id | Soft delete transaction | admin |

#### Query Parameters for GET /api/transactions
| Param | Type | Description |
|-------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Records per page (default: 10) |
| type | string | Filter by income / expense |
| category | string | Filter by category (partial match) |
| startDate | string | Filter from date (YYYY-MM-DD) |
| endDate | string | Filter to date (YYYY-MM-DD) |
| sortBy | string | Sort field: date, amount, category, type |
| sortOrder | string | ASC or DESC (default: DESC) |

### Dashboard Analytics
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | /api/dashboard/summary | Total income, expenses, net balance | analyst, admin |
| GET | /api/dashboard/categories | Category-wise totals | analyst, admin |
| GET | /api/dashboard/trends/monthly | Monthly income/expense trends | analyst, admin |
| GET | /api/dashboard/trends/weekly | Weekly income/expense trends | analyst, admin |
| GET | /api/dashboard/recent | Last 10 transactions | all |

---

## Validation & Error Handling

- Email format validated on registration
- Password minimum 8 characters, must include uppercase, number, and special character
- Transaction amount must be a positive number
- Date must be in YYYY-MM-DD format
- Type must be exactly `income` or `expense`
- Role must be `viewer`, `analyst`, or `admin`
- All errors return appropriate HTTP status codes:
  - `400` Bad Request (validation errors)
  - `401` Unauthorized (missing/invalid token)
  - `403` Forbidden (insufficient role)
  - `404` Not Found
  - `500` Internal Server Error

---

## Assumptions Made

1. Role can be set at registration for testing purposes. In production, only admins would assign roles.
2. Deleting a user sets status to `inactive` (soft delete) — they cannot log in but data is preserved.
3. Deleting a transaction sets `is_deleted = 1` — data is preserved for audit purposes.
4. JWT tokens expire in 1 hour.
5. Inactive users cannot log in even with correct credentials.
6. The `created_by` field on transactions tracks which admin created the record.

---

## Running Tests (Manual via Swagger)

1. Start the server: `npm run dev`
2. Open: `http://localhost:3000/api-docs`
3. Register an admin user via `POST /api/register`
4. Login via `POST /api/login` and copy the token
5. Click **Authorize** and enter `Bearer <token>`
6. Test all endpoints

---

## Frontend

The React frontend is located in `finance-dashboard/`. See the frontend README for setup instructions.
