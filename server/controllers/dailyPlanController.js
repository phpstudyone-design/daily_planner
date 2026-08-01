// server/controllers/dailyPlanController.js
const dailyPlanService = require('../services/dailyPlanService');

// Normalize a date value to YYYY-MM-DD (local time)
function normalizeDate(dateInput) {
  if (!dateInput) return new Date().toISOString().split('T')[0];
  // If it's already a YYYY-MM-DD string, use as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return dateInput;
  // Otherwise parse and extract local date
  const d = new Date(dateInput);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('-');
}

// Get today's plan (auto-generate if not exists)
exports.getTodayPlan = async (req, res) => {
  try {
    const dateStr = req.query.date;
    const targetDate = normalizeDate(dateStr);

    const plan = await dailyPlanService.getOrCreateDailyPlan(targetDate);
    res.json({ success: true, data: plan });
  } catch (err) {
    console.error('getTodayPlan error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update plan items (toggle done, reorder)
exports.updatePlanItems = async (req, res) => {
  try {
    const { date, plan_items } = req.body;
    const normalizedDate = normalizeDate(date);
    await dailyPlanService.updateDailyPlanItems(normalizedDate, plan_items);
    const updated = await dailyPlanService.getDailyPlan(normalizedDate);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('updatePlanItems error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all plans for dashboard
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await dailyPlanService.getAllPlans();
    res.json({ success: true, data: plans });
  } catch (err) {
    console.error('getAllPlans error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get plan by date
exports.getPlanByDate = async (req, res) => {
  try {
    const normalizedDate = normalizeDate(req.params.date);
    const plan = await dailyPlanService.getDailyPlan(normalizedDate);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (err) {
    console.error('getPlanByDate error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
