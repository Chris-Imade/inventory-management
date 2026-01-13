const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['LOW_STOCK', 'EXPIRY_CRITICAL', 'EXPIRY_WARNING', 'EXPIRY_NOTICE', 'OUT_OF_STOCK'],
  },
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'warning', 'notice'],
  },
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  isDismissed: {
    type: Boolean,
    default: false,
  },
  dismissedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

alertSchema.index({ type: 1, isRead: 1 });
alertSchema.index({ severity: 1, isRead: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
