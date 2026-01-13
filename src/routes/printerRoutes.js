const express = require('express');
const router = express.Router();
const printerService = require('../services/printerService');
const { isAuthenticated } = require('../middleware/auth');
const { asyncHandler } = require('../utils/errorHandler');

router.use(isAuthenticated);

router.get('/status', asyncHandler(async (req, res) => {
  const status = printerService.getStatus();
  res.status(200).json(status);
}));

router.post('/test', asyncHandler(async (req, res) => {
  const result = await printerService.testPrint();
  res.status(200).json(result);
}));

module.exports = router;
