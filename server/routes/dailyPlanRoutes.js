// server/routes/dailyPlanRoutes.js
const express = require('express');
const router = express.Router();
const dailyPlanController = require('../controllers/dailyPlanController');

// Static routes MUST be before parameterized routes to avoid conflicts
router.get('/all', dailyPlanController.getAllPlans);
router.get('/today', dailyPlanController.getTodayPlan);
router.get('/:date', dailyPlanController.getPlanByDate);
router.put('/', dailyPlanController.updatePlanItems);
router.delete('/:date', dailyPlanController.deletePlan);

module.exports = router;
