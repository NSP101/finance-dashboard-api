const db = require("../models/db");

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

const queryOne = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });

// Total income, expenses, net balance
exports.getSummary = () =>
  queryOne(`
    SELECT
      COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS total_expenses,
      COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END), 0) AS net_balance
    FROM transactions WHERE is_deleted = 0
  `);

// Category-wise totals
exports.getCategoryTotals = () =>
  query(`
    SELECT category, type,
      SUM(amount) AS total,
      COUNT(*) AS count
    FROM transactions WHERE is_deleted = 0
    GROUP BY category, type
    ORDER BY total DESC
  `);

// Monthly trends
exports.getMonthlyTrends = () =>
  query(`
    SELECT
      strftime('%Y-%m', date) AS month,
      type,
      SUM(amount) AS total
    FROM transactions WHERE is_deleted = 0
    GROUP BY month, type
    ORDER BY month DESC
    LIMIT 24
  `);

// Recent activity (last 10 transactions)
exports.getRecentActivity = () =>
  query(`
    SELECT id, amount, type, category, date, notes, created_at
    FROM transactions WHERE is_deleted = 0
    ORDER BY created_at DESC LIMIT 10
  `);

// Weekly trends (last 8 weeks)
exports.getWeeklyTrends = () =>
  query(`
    SELECT
      strftime('%Y-W%W', date) AS week,
      type,
      SUM(amount) AS total
    FROM transactions WHERE is_deleted = 0
    GROUP BY week, type
    ORDER BY week DESC
    LIMIT 16
  `);
