const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  next();
};

const inventoryValidation = {
  create: [
    body('itemName').trim().notEmpty().withMessage('Item name is required'),
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    body('category').isIn(['medication', 'equipment', 'consumables', 'surgical', 'diagnostic', 'other']).withMessage('Invalid category'),
    body('unitType').isIn(['piece', 'box', 'bottle', 'vial', 'pack', 'strip', 'tube', 'sachet', 'other']).withMessage('Invalid unit type'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a non-negative number'),
    body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be a non-negative number'),
    body('minimumStock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
    body('expirationDate').optional().isISO8601().withMessage('Invalid expiration date'),
    validate,
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid inventory item ID'),
    body('itemName').optional().trim().notEmpty().withMessage('Item name cannot be empty'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('unitPrice').optional().isFloat({ min: 0 }).withMessage('Unit price must be a non-negative number'),
    body('sellingPrice').optional().isFloat({ min: 0 }).withMessage('Selling price must be a non-negative number'),
    validate,
  ],
};

const transactionValidation = {
  create: [
    body('lineItems').isArray({ min: 1 }).withMessage('At least one line item is required'),
    body('lineItems.*.inventoryItem').isMongoId().withMessage('Invalid inventory item ID'),
    body('lineItems.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('paymentMethod').optional().isIn(['cash', 'card', 'insurance', 'other']).withMessage('Invalid payment method'),
    validate,
  ],
  cancel: [
    param('id').isMongoId().withMessage('Invalid transaction ID'),
    body('cancellationReason').trim().notEmpty().withMessage('Cancellation reason is required'),
    validate,
  ],
};

module.exports = {
  validate,
  inventoryValidation,
  transactionValidation,
};
