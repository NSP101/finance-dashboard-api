require("dotenv").config();
const db = require("./models/db");
const bcrypt = require("bcryptjs");

const seed = async () => {
  console.log("Seeding database...");

  // Hash passwords
  const adminHash = await bcrypt.hash("Admin@123", 10);
  const analystHash = await bcrypt.hash("Analyst@123", 10);
  const viewerHash = await bcrypt.hash("Viewer@123", 10);

  // Insert users
  const users = [
    ["Admin User", "admin@test.com", adminHash, "admin"],
    ["Analyst User", "analyst@test.com", analystHash, "analyst"],
    ["Viewer User", "viewer@test.com", viewerHash, "viewer"],
  ];

  for (const [name, email, password, role] of users) {
    db.run(
      `INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name, email, password, role],
      (err) => { if (!err) console.log(`✅ User: ${email} (${role})`); }
    );
  }

  // Insert transactions
  const transactions = [
    [55000, "income",  "Salary",      "2024-01-01", "January salary",        1],
    [1200,  "expense", "Rent",        "2024-01-05", "Monthly rent",          1],
    [300,   "expense", "Food",        "2024-01-10", "Groceries",             1],
    [150,   "expense", "Transport",   "2024-01-15", "Fuel",                  1],
    [5000,  "income",  "Freelance",   "2024-01-20", "Web project payment",   1],
    [55000, "income",  "Salary",      "2024-02-01", "February salary",       1],
    [1200,  "expense", "Rent",        "2024-02-05", "Monthly rent",          1],
    [450,   "expense", "Food",        "2024-02-12", "Groceries",             1],
    [200,   "expense", "Utilities",   "2024-02-18", "Electricity bill",      1],
    [3000,  "income",  "Freelance",   "2024-02-22", "Design project",        1],
    [55000, "income",  "Salary",      "2024-03-01", "March salary",          1],
    [1200,  "expense", "Rent",        "2024-03-05", "Monthly rent",          1],
    [500,   "expense", "Food",        "2024-03-08", "Groceries",             1],
    [800,   "expense", "Shopping",    "2024-03-14", "Clothes",               1],
    [2500,  "income",  "Freelance",   "2024-03-25", "Consulting fee",        1],
    [55000, "income",  "Salary",      "2024-04-01", "April salary",          1],
    [1200,  "expense", "Rent",        "2024-04-05", "Monthly rent",          1],
    [350,   "expense", "Food",        "2024-04-09", "Groceries",             1],
    [100,   "expense", "Transport",   "2024-04-11", "Metro pass",            1],
    [4000,  "income",  "Freelance",   "2024-04-20", "App development",       1],
  ];

  setTimeout(() => {
    for (const [amount, type, category, date, notes, created_by] of transactions) {
      db.run(
        `INSERT OR IGNORE INTO transactions (amount, type, category, date, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
        [amount, type, category, date, notes, created_by],
        (err) => { if (!err) console.log(`✅ Transaction: ${type} ₹${amount} - ${category}`); }
      );
    }
    setTimeout(() => {
      console.log("\n✅ Seed complete!");
      console.log("Login credentials:");
      console.log("  Admin:    admin@test.com    / Admin@123");
      console.log("  Analyst:  analyst@test.com  / Analyst@123");
      console.log("  Viewer:   viewer@test.com   / Viewer@123");
      process.exit(0);
    }, 1000);
  }, 500);
};

seed();
