const service = require("../services/transactionService");

exports.create = async (req, res) => {
  try {
    const result = await service.createTransaction({ ...req.body, created_by: req.user.id });
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category, startDate, endDate, sortBy = 'date', sortOrder = 'DESC' } = req.query;
    const result = await service.getTransactions({
      page: parseInt(page), limit: parseInt(limit),
      type, category, startDate, endDate, sortBy, sortOrder
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    res.json(await service.getTransactionById(req.params.id));
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    res.json(await service.updateTransaction(req.params.id, req.body));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    res.json(await service.deleteTransaction(req.params.id));
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
};
