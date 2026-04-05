const service = require("../services/userService");

// REGISTER
exports.register = async (req, res) => {
  try {
    res.status(201).json(await service.registerUser(req.body));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    res.json(await service.loginUser(req.body));
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
};

// GET USERS (admin only)
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    res.json(await service.getUsers({ page: parseInt(page), limit: parseInt(limit), search }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// UPDATE USER (admin only)
exports.updateUser = async (req, res) => {
  try {
    res.json(await service.updateUser(req.params.id, req.body));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE USER (admin only — soft delete)
exports.deleteUser = async (req, res) => {
  try {
    res.json(await service.deleteUser(req.params.id));
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
};

// CHANGE PASSWORD (own account)
exports.changePassword = async (req, res) => {
  try {
    res.json(await service.changePassword(req.user.id, req.body));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    res.json(await service.forgotPassword(req.body.email));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    res.json(await service.resetPassword(email, resetToken, newPassword));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
