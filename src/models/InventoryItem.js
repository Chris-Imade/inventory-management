const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  batchNumber: {
    type: String,
    trim: true,
  },
  expirationDate: {
    type: Date,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  unitType: {
    type: String,
    required: true,
    enum: ['piece', 'box', 'bottle', 'vial', 'pack', 'strip', 'tube', 'sachet', 'other'],
    default: 'piece',
  },
  category: {
    type: String,
    required: true,
    enum: ['medication', 'equipment', 'consumables', 'surgical', 'diagnostic', 'other'],
  },
  subcategory: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  manufacturer: {
    type: String,
    trim: true,
  },
  supplier: {
    type: String,
    trim: true,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  minimumStock: {
    type: Number,
    default: 10,
    min: 0,
  },
  storageLocation: {
    type: String,
    trim: true,
  },
  requiresPrescription: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

inventoryItemSchema.index({ barcode: 1 });
inventoryItemSchema.index({ sku: 1 });
inventoryItemSchema.index({ category: 1 });
inventoryItemSchema.index({ expirationDate: 1 });

inventoryItemSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minimumStock;
});

inventoryItemSchema.virtual('isExpiringSoon').get(function() {
  if (!this.expirationDate) return false;
  const daysUntilExpiry = Math.floor((this.expirationDate - new Date()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 90 && daysUntilExpiry >= 0;
});

inventoryItemSchema.virtual('isExpired').get(function() {
  if (!this.expirationDate) return false;
  return this.expirationDate < new Date();
});

inventoryItemSchema.set('toJSON', { virtuals: true });
inventoryItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
