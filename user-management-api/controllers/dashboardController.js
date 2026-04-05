const service = require("../services/dashboardService");

exports.getSummary = async (req, res) => {
  try { res.json(await service.getSummary()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getCategoryTotals = async (req, res) => {
  try { res.json(await service.getCategoryTotals()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getMonthlyTrends = async (req, res) => {
  try { res.json(await service.getMonthlyTrends()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getWeeklyTrends = async (req, res) => {
  try { res.json(await service.getWeeklyTrends()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getRecentActivity = async (req, res) => {
  try { res.json(await service.getRecentActivity()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};
