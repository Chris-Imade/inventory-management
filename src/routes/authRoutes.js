const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', isAuthenticated, authController.getCurrentUser);
router.post('/change-password', isAuthenticated, authController.changePassword);

module.exports = router;
