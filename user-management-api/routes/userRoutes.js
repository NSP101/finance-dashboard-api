const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const { authenticate, roleGuard } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Naveen
 *               email:
 *                 type: string
 *                 example: naveen@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [viewer, analyst, admin]
 *                 example: admin
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post("/register", controller.register);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: naveen@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful, returns token and role
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", controller.login);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Access denied
 */
router.get("/users", authenticate, roleGuard("admin"), controller.getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user role/status (admin only)
 *     tags: [Users]
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [viewer, analyst, admin]
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: User updated
 *       403:
 *         description: Access denied
 */
router.put("/users/:id", authenticate, roleGuard("admin"), controller.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deactivate a user (admin only)
 *     tags: [Users]
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
 *         description: User deactivated
 *       403:
 *         description: Access denied
 */
router.delete("/users/:id", authenticate, roleGuard("admin"), controller.deleteUser);

/**
 * @swagger
 * /api/profile/password:
 *   put:
 *     summary: Change own password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "newpass123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Incorrect current password
 */
router.put("/profile/password", authenticate, controller.changePassword);

/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Request a password reset token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@test.com
 *     responses:
 *       200:
 *         description: Reset token generated (returned directly, would be emailed in production)
 *       400:
 *         description: Email not found
 */
router.post("/forgot-password", controller.forgotPassword);

/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - resetToken
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@test.com
 *               resetToken:
 *                 type: string
 *                 example: A3F9KZ2B
 *               newPassword:
 *                 type: string
 *                 example: "NewPass@123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post("/reset-password", controller.resetPassword);

module.exports = router;