const express = require('express');
const router = express.Router();
const alertController = require('../notifications/alertController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', alertController.getAlerts);
router.get('/stats', alertController.getAlertStats);
router.post('/generate', alertController.generateAlerts);
router.patch('/:id/read', alertController.markAsRead);
router.patch('/:id/dismiss', alertController.dismissAlert);

module.exports = router;
