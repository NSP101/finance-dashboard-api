const db = require("../models/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "finance_dashboard_super_secret_key";

// ================= REGISTER =================
exports.registerUser = ({ name, email, password, role = "viewer" }) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!name || !email || !password) {
        return reject(new Error("All fields required"));
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return reject(new Error("Invalid email format"));
      }
      if (password.length < 8) {
        return reject(new Error("Password must be at least 8 characters"));
      }
      if (!/[A-Z]/.test(password)) {
        return reject(new Error("Password must contain at least one uppercase letter"));
      }
      if (!/[0-9]/.test(password)) {
        return reject(new Error("Password must contain at least one number"));
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return reject(new Error("Password must contain at least one special character"));
      }
      const validRoles = ["viewer", "analyst", "admin"];
      if (!validRoles.includes(role)) {
        return reject(new Error("Invalid role. Must be viewer, analyst, or admin"));
      }

      const hashed = await bcrypt.hash(password, 10);
      db.run(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashed, role],
        function (err) {
          if (err) return reject(new Error("Email already exists"));
          resolve({ message: "User registered successfully", userId: this.lastID });
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

// ================= LOGIN =================
exports.loginUser = ({ email, password }) => {
  return new Promise((resolve, reject) => {
    if (!email || !password) {
      return reject(new Error("Email and password are required"));
    }
    db.get(
      "SELECT * FROM users WHERE email = ? AND status = 'active'",
      [email],
      async (err, user) => {
        if (err) return reject(err);
        if (!user) return reject(new Error("Invalid credentials or account inactive"));

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return reject(new Error("Invalid credentials"));

        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        resolve({ token, role: user.role, name: user.name });
      }
    );
  });
};

// ================= GET USERS =================
exports.getUsers = ({ page = 1, limit = 10, search = "" }) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    db.all(
      `SELECT id, name, email, role, status, created_at FROM users
       WHERE name LIKE ? OR email LIKE ? LIMIT ? OFFSET ?`,
      [`%${search}%`, `%${search}%`, limit, offset],
      (err, rows) => {
        if (err) return reject(err);
        db.get(
          `SELECT COUNT(*) as total FROM users WHERE name LIKE ? OR email LIKE ?`,
          [`%${search}%`, `%${search}%`],
          (err2, countRow) => {
            if (err2) return reject(err2);
            resolve({ data: rows, total: countRow.total, page, limit });
          }
        );
      }
    );
  });
};

// ================= UPDATE USER =================
exports.updateUser = (id, data) => {
  return new Promise((resolve, reject) => {
    const validRoles = ["viewer", "analyst", "admin"];
    const validStatuses = ["active", "inactive"];
    if (data.role && !validRoles.includes(data.role)) {
      return reject(new Error("Invalid role"));
    }
    if (data.status && !validStatuses.includes(data.status)) {
      return reject(new Error("Invalid status"));
    }
    db.run(
      `UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [data.name || null, data.email || null, data.role || null, data.status || null, id],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error("User not found"));
        resolve({ message: "User updated successfully" });
      }
    );
  });
};

// ================= DELETE USER (soft) =================
exports.deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE users SET status = 'inactive' WHERE id = ?",
      [id],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error("User not found"));
        resolve({ message: "User deactivated successfully" });
      }
    );
  });
};

// ================= CHANGE PASSWORD =================
exports.changePassword = (id, { currentPassword, newPassword }) => {
  return new Promise((resolve, reject) => {
    if (!currentPassword || !newPassword) {
      return reject(new Error("Current and new password are required"));
    }
    if (newPassword.length < 8) {
      return reject(new Error("Password must be at least 8 characters"));
    }
    if (!/[A-Z]/.test(newPassword)) {
      return reject(new Error("Password must contain at least one uppercase letter"));
    }
    if (!/[0-9]/.test(newPassword)) {
      return reject(new Error("Password must contain at least one number"));
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return reject(new Error("Password must contain at least one special character"));
    }
    db.get("SELECT * FROM users WHERE id = ?", [id], async (err, user) => {
      if (err) return reject(err);
      if (!user) return reject(new Error("User not found"));
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return reject(new Error("Current password is incorrect"));
      const hashed = await bcrypt.hash(newPassword, 10);
      db.run("UPDATE users SET password = ? WHERE id = ?", [hashed, id], function (err2) {
        if (err2) return reject(err2);
        resolve({ message: "Password changed successfully" });
      });
    });
  });
};

// ================= FORGOT PASSWORD (generate reset token) =================
exports.forgotPassword = (email) => {
  return new Promise((resolve, reject) => {
    if (!email) return reject(new Error("Email is required"));

    db.get("SELECT * FROM users WHERE email = ? AND status = 'active'", [email], (err, user) => {
      if (err) return reject(err);
      if (!user) return reject(new Error("No active account found with that email"));

      const resetToken = Math.random().toString(36).slice(2, 10).toUpperCase(); // e.g. A3F9KZ2B
      const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

      db.run(
        "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
        [resetToken, expiry, user.id],
        function (err2) {
          if (err2) return reject(err2);
          // In production this would be emailed — for now we return it directly
          console.log(`[RESET TOKEN] ${email} → ${resetToken}`);
          resolve({ message: "Reset token generated", resetToken, note: "In production this would be sent via email" });
        }
      );
    });
  });
};

// ================= RESET PASSWORD (using token) =================
exports.resetPassword = (email, resetToken, newPassword) => {
  return new Promise((resolve, reject) => {
    if (!email || !resetToken || !newPassword) {
      return reject(new Error("Email, reset token, and new password are required"));
    }
    if (newPassword.length < 8) return reject(new Error("Password must be at least 8 characters"));
    if (!/[A-Z]/.test(newPassword)) return reject(new Error("Password must contain at least one uppercase letter"));
    if (!/[0-9]/.test(newPassword)) return reject(new Error("Password must contain at least one number"));
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return reject(new Error("Password must contain at least one special character"));
    }

    db.get(
      "SELECT * FROM users WHERE email = ? AND reset_token = ?",
      [email, resetToken],
      async (err, user) => {
        if (err) return reject(err);
        if (!user) return reject(new Error("Invalid reset token"));
        if (new Date(user.reset_token_expiry) < new Date()) {
          return reject(new Error("Reset token has expired. Please request a new one"));
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        db.run(
          "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
          [hashed, user.id],
          function (err2) {
            if (err2) return reject(err2);
            resolve({ message: "Password reset successfully. You can now login." });
          }
        );
      }
    );
  });
};
