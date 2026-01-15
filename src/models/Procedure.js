const mongoose = require('mongoose');

const procedureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  standardPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

procedureSchema.index({ name: 1 });

module.exports = mongoose.model('Procedure', procedureSchema);
