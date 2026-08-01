// server/routes/taskPoolRoutes.js
const express = require('express');
const router = express.Router();
const taskPoolController = require('../controllers/taskPoolController');

router.get('/', taskPoolController.getAllTasks);
router.post('/', taskPoolController.createTask);
router.put('/:id', taskPoolController.updateTask);
router.delete('/:id', taskPoolController.deleteTask);

module.exports = router;
