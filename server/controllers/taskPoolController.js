// server/controllers/taskPoolController.js
const taskPoolService = require('../services/taskPoolService');

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await taskPoolService.getAllTasks();
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const task = await taskPoolService.createTask(req.body);
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await taskPoolService.updateTask(req.params.id, req.body);
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await taskPoolService.deleteTask(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
