const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboardController");
const { authenticate, roleGuard } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Summary and analytics APIs
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Total income, expenses, net balance (analyst, admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary
 */
router.get("/summary", authenticate, roleGuard("analyst", "admin"), controller.getSummary);

/**
 * @swagger
 * /api/dashboard/categories:
 *   get:
 *     summary: Category-wise totals (analyst, admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Totals grouped by category and type
 */
router.get("/categories", authenticate, roleGuard("analyst", "admin"), controller.getCategoryTotals);

/**
 * @swagger
 * /api/dashboard/trends/monthly:
 *   get:
 *     summary: Monthly income/expense trends (analyst, admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly trend data
 */
router.get("/trends/monthly", authenticate, roleGuard("analyst", "admin"), controller.getMonthlyTrends);

/**
 * @swagger
 * /api/dashboard/trends/weekly:
 *   get:
 *     summary: Weekly income/expense trends (analyst, admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly trend data
 */
router.get("/trends/weekly", authenticate, roleGuard("analyst", "admin"), controller.getWeeklyTrends);

/**
 * @swagger
 * /api/dashboard/recent:
 *   get:
 *     summary: Recent 10 transactions (viewer, analyst, admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity
 */
router.get("/recent", authenticate, roleGuard("viewer", "analyst", "admin"), controller.getRecentActivity);

module.exports = router;
