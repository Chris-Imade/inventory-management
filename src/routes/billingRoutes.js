const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

router.post('/bills', billingController.createOrUpdateBill);
router.put('/bills/:billId', billingController.createOrUpdateBill);
router.get('/bills', billingController.getAllBills);
router.get('/bills/:billId', billingController.getBill);
router.patch('/bills/:billId/status', billingController.updateBillStatus);
router.delete('/bills/:billId', billingController.deleteBill);
router.get('/bills/:billId/print', billingController.printBill);

router.get('/procedures', billingController.getProcedures);
router.post('/procedures', billingController.createProcedure);

router.get('/drugs/search', billingController.searchDrugs);

module.exports = router;
