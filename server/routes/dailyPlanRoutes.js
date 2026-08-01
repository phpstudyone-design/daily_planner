// server/routes/dailyPlanRoutes.js
const express = require('express');
const router = express.Router();
const dailyPlanController = require('../controllers/dailyPlanController');

router.get('/today', dailyPlanController.getTodayPlan);
router.get('/:date', dailyPlanController.getPlanByDate);
router.put('/', dailyPlanController.updatePlanItems);
router.get('/all', dailyPlanController.getAllPlans);

module.exports = router;
