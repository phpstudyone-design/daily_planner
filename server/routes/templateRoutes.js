// server/routes/templateRoutes.js
const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

router.get('/', templateController.getAllTemplates);
router.post('/', templateController.createTemplate);
router.put('/:id', templateController.updateTemplate);
router.put('/:id/set-default', templateController.setDefault);
router.delete('/:id', templateController.deleteTemplate);

module.exports = router;
