const express = require("express");
const router = express.Router();
const controller = require("../controllers/transactionController");
const { authenticate, roleGuard } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Financial records management
 */

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a transaction (admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - category
 *               - date
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: income
 *               category:
 *                 type: string
 *                 example: Salary
 *               date:
 *                 type: string
 *                 example: "2024-01-15"
 *               notes:
 *                 type: string
 *                 example: Monthly salary
 *     responses:
 *       201:
 *         description: Transaction created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied
 */
router.post("/", authenticate, roleGuard("admin"), controller.create);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions with filters
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           example: "2024-12-31"
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get("/", authenticate, roleGuard("viewer", "analyst", "admin"), controller.getAll);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get a single transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Not found
 */
router.get("/:id", authenticate, roleGuard("viewer", "analyst", "admin"), controller.getOne);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update a transaction (admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated
 *       403:
 *         description: Access denied
 */
router.put("/:id", authenticate, roleGuard("admin"), controller.update);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction (admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction deleted
 *       403:
 *         description: Access denied
 */
router.delete("/:id", authenticate, roleGuard("admin"), controller.remove);

module.exports = router;
