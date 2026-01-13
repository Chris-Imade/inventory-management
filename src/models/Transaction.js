const mongoose = require('mongoose');

const transactionLineItemSchema = new mongoose.Schema({
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true,
  },
  itemSnapshot: {
    itemName: String,
    sku: String,
    barcode: String,
    batchNumber: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['COMPLETED', 'CANCELLED'],
    default: 'COMPLETED',
  },
  lineItems: [transactionLineItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'insurance', 'other'],
    default: 'cash',
  },
  patientName: {
    type: String,
    trim: true,
  },
  patientId: {
    type: String,
    trim: true,
  },
  prescriptionNumber: {
    type: String,
    trim: true,
  },
  cancelledAt: {
    type: Date,
  },
  cancellationReason: {
    type: String,
    trim: true,
  },
  cancelledBy: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  receiptPrinted: {
    type: Boolean,
    default: false,
  },
  printedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ patientId: 1 });

transactionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'CANCELLED' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
