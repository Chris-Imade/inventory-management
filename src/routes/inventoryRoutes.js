const express = require('express');
const router = express.Router();
const inventoryController = require('../inventory/inventoryController');
const { isAuthenticated } = require('../middleware/auth');
const { inventoryValidation } = require('../utils/validators');

router.use(isAuthenticated);

router.get('/', inventoryController.getAllItems);
router.get('/stats', inventoryController.getInventoryStats);
router.get('/low-stock', inventoryController.getLowStockItems);
router.get('/expiring', inventoryController.getExpiringItems);
router.get('/expired', inventoryController.getExpiredItems);
router.get('/barcode/:barcode', inventoryController.getItemByBarcode);
router.get('/:id', inventoryController.getItemById);
router.get('/:id/barcode', inventoryController.generateBarcode);

router.post('/', inventoryValidation.create, inventoryController.createItem);
router.put('/:id', inventoryValidation.update, inventoryController.updateItem);
router.patch('/:id/adjust', inventoryController.adjustQuantity);
router.delete('/:id', inventoryController.deactivateItem);

module.exports = router;
