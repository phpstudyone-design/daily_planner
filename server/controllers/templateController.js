// server/controllers/templateController.js
const templateService = require('../services/templateService');

exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await templateService.getAllTemplates();
    res.json({ success: true, data: templates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const template = await templateService.createTemplate(req.body);
    res.json({ success: true, data: template });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const template = await templateService.updateTemplate(req.params.id, req.body);
    res.json({ success: true, data: template });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.setDefault = async (req, res) => {
  try {
    const template = await templateService.setDefaultTemplate(req.params.id);
    res.json({ success: true, data: template });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    await templateService.deleteTemplate(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
