const db = require("../models/db");

const VALID_TYPES = ["income", "expense"];

// ================= CREATE =================
exports.createTransaction = ({ amount, type, category, date, notes, created_by }) => {
  return new Promise((resolve, reject) => {
    if (!amount || !type || !category || !date) {
      return reject(new Error("amount, type, category, and date are required"));
    }
    if (isNaN(amount) || Number(amount) <= 0) {
      return reject(new Error("amount must be a positive number"));
    }
    if (!VALID_TYPES.includes(type)) {
      return reject(new Error("type must be 'income' or 'expense'"));
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return reject(new Error("date must be in YYYY-MM-DD format"));
    }

    db.run(
      `INSERT INTO transactions (amount, type, category, date, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [Number(amount), type, category, date, notes || null, created_by],
      function (err) {
        if (err) return reject(err);
        resolve({ message: "Transaction created", transactionId: this.lastID });
      }
    );
  });
};

// ================= GET ALL (with filters) =================
exports.getTransactions = ({ page = 1, limit = 10, type, category, startDate, endDate, sortBy = 'date', sortOrder = 'DESC' }) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    const conditions = ["is_deleted = 0"];
    const params = [];

    if (type) { conditions.push("type = ?"); params.push(type); }
    if (category) { conditions.push("category LIKE ?"); params.push(`%${category}%`); }
    if (startDate) { conditions.push("date >= ?"); params.push(startDate); }
    if (endDate) { conditions.push("date <= ?"); params.push(endDate); }

    const validSortFields = ['date', 'amount', 'category', 'type', 'created_at'];
    const validOrders = ['ASC', 'DESC'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'date';
    const safeSortOrder = validOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const where = conditions.join(" AND ");

    db.all(
      `SELECT * FROM transactions WHERE ${where} ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ? OFFSET ?`,
      [...params, limit, offset],
      (err, rows) => {
        if (err) return reject(err);
        db.get(
          `SELECT COUNT(*) as total FROM transactions WHERE ${where}`,
          params,
          (err2, countRow) => {
            if (err2) return reject(err2);
            resolve({ data: rows, total: countRow.total, page, limit });
          }
        );
      }
    );
  });
};

// ================= GET ONE =================
exports.getTransactionById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM transactions WHERE id = ? AND is_deleted = 0",
      [id],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error("Transaction not found"));
        resolve(row);
      }
    );
  });
};

// ================= UPDATE =================
exports.updateTransaction = (id, data) => {
  return new Promise((resolve, reject) => {
    if (data.type && !VALID_TYPES.includes(data.type)) {
      return reject(new Error("type must be 'income' or 'expense'"));
    }
    if (data.amount && (isNaN(data.amount) || Number(data.amount) <= 0)) {
      return reject(new Error("amount must be a positive number"));
    }
    if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      return reject(new Error("date must be in YYYY-MM-DD format"));
    }

    db.run(
      `UPDATE transactions SET
        amount = COALESCE(?, amount),
        type = COALESCE(?, type),
        category = COALESCE(?, category),
        date = COALESCE(?, date),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND is_deleted = 0`,
      [
        data.amount ? Number(data.amount) : null,
        data.type || null,
        data.category || null,
        data.date || null,
        data.notes || null,
        id
      ],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error("Transaction not found"));
        resolve({ message: "Transaction updated successfully" });
      }
    );
  });
};

// ================= SOFT DELETE =================
exports.deleteTransaction = (id) => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE transactions SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_deleted = 0",
      [id],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error("Transaction not found"));
        resolve({ message: "Transaction deleted successfully" });
      }
    );
  });
};
