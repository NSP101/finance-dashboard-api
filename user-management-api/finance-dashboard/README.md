# Finance Dashboard — Frontend

A React-based frontend for the Finance Data Processing backend. Provides a role-aware dashboard with charts, transaction management, user administration, and profile settings.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 (Vite) |
| HTTP Client | Axios |
| Charts | Recharts |
| Styling | Plain CSS |

---

## Project Structure

```
finance-dashboard/
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Root component, routing, auth state
│   ├── api.js                # Axios instance with JWT interceptor
│   ├── index.css             # Global styles
│   ├── pages/
│   │   ├── Login.jsx         # Login and register forms
│   │   ├── Dashboard.jsx     # Summary widgets, charts, recent activity
│   │   ├── Transactions.jsx  # CRUD, filters, sort, pagination, CSV export
│   │   ├── Users.jsx         # User management (admin only)
│   │   └── Profile.jsx       # Account info and change password
│   ├── components/
│   │   ├── Toast.jsx         # Toast notification display
│   │   ├── Spinner.jsx       # Loading spinner
│   │   └── EmptyState.jsx    # Empty state illustration
│   └── hooks/
│       └── useToast.js       # Toast state management hook
```

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- Backend API running on `http://localhost:3000` or live at `https://finance-dashboard-api-g0ja.onrender.com`
- Live API Docs: `https://finance-dashboard-api-g0ja.onrender.com/api-docs`

### Steps

```bash
# From the project root
cd user-management-api/finance-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Features by Page

### Login / Register
- Toggle between login and register forms
- Role selection on register (viewer / analyst / admin)
- JWT token stored in localStorage on login
- Forgot password — request reset token via email (returned directly in dev)
- Reset password using token (valid 15 minutes)

### Dashboard
- Summary widgets: Total Income, Total Expenses, Net Balance, Transaction Count
- Clicking any widget navigates to Transactions page
- Monthly trends bar chart (income vs expense)
- Weekly trends bar chart
- Category breakdown pie chart with color legend
- Recent activity table (last 10 transactions)
- Analytics widgets visible to analyst and admin only

### Transactions
- Full CRUD (create, edit, delete) — admin only
- Filter by type, category, date range
- Sort by date, amount, category, type (click column headers)
- Pagination (5 records per page)
- Export current page to CSV
- Loading spinner while fetching
- Empty state when no results found
- Toast notifications for all actions

### Users (admin only)
- List all users with search
- Sort by name, email, role, status
- Change user role via dropdown
- Activate / deactivate users
- Toast notifications for all actions

### Profile
- View account info (name, email, role)
- Change password with current password verification
- Toast notifications for success and errors

---

## Role-Based UI Behavior

| Feature | viewer | analyst | admin |
|---------|--------|---------|-------|
| Dashboard summary widgets | ❌ | ✅ | ✅ |
| Charts (monthly, weekly, pie) | ❌ | ✅ | ✅ |
| View transactions | ✅ | ✅ | ✅ |
| Add / Edit / Delete transactions | ❌ | ❌ | ✅ |
| Export CSV | ✅ | ✅ | ✅ |
| Users tab | ❌ | ❌ | ✅ |
| Profile / Change password | ✅ | ✅ | ✅ |
