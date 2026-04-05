const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "finance_dashboard_super_secret_key";

// Verifies JWT and attaches user to req
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Access denied. No token provided." });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Role-based guard factory: roleGuard("admin") or roleGuard("admin", "analyst")
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`
      });
    }
    next();
  };
};

module.exports = { authenticate, roleGuard };