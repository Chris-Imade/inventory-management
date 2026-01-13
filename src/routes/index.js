const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const transactionRoutes = require('./transactionRoutes');
const posRoutes = require('./posRoutes');
const alertRoutes = require('./alertRoutes');
const reportRoutes = require('./reportRoutes');

router.use('/auth', authRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/pos', posRoutes);
router.use('/alerts', alertRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
