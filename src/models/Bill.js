const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    required: true,
    unique: true,
  },
  patientName: {
    type: String,
    trim: true,
  },
  patientId: {
    type: String,
    trim: true,
  },
  cardType: {
    type: String,
    enum: ['Personal Card', 'Family Card', 'Premium Card'],
  },
  consultation: {
    type: {
      type: String,
      enum: ['House Doctor', 'Cardiologist', 'Neurologist', 'Dermatologist'],
    },
    price: Number,
    isEmergency: {
      type: Boolean,
      default: false,
    },
    emergencyFee: {
      type: Number,
      default: 0,
    },
  },
  drugs: [{
    drugId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
    },
    drugName: String,
    numberOfUnits: Number,
    numberOfDays: Number,
    timesDaily: {
      type: String,
      enum: ['1 Daily', 'BD', 'TDS', 'QDS', 'AD', 'Weekly'],
    },
    duration: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly'],
    },
    pricePerUnit: Number,
    subtotal: Number,
  }],
  procedures: [{
    procedureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Procedure',
    },
    procedureName: String,
    price: Number,
  }],
  admissionFee: {
    type: {
      type: String,
      enum: ['VIP', 'Private', 'Shared Room', 'Nursery Care'],
    },
    price: Number,
  },
  subtotalCard: {
    type: Number,
    default: 0,
  },
  subtotalConsultation: {
    type: Number,
    default: 0,
  },
  subtotalDrugs: {
    type: Number,
    default: 0,
  },
  subtotalProcedures: {
    type: Number,
    default: 0,
  },
  subtotalAdmission: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING', 'PAID', 'CANCELLED'],
    default: 'DRAFT',
  },
  paidAt: Date,
  cancelledAt: Date,
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

billSchema.index({ billNumber: 1 });
billSchema.index({ patientId: 1 });
billSchema.index({ status: 1 });

billSchema.pre('save', function(next) {
  this.subtotalConsultation = 0;
  if (this.consultation && this.consultation.price) {
    this.subtotalConsultation = this.consultation.price + (this.consultation.emergencyFee || 0);
  }
  
  this.subtotalDrugs = this.drugs.reduce((sum, drug) => sum + (drug.subtotal || 0), 0);
  this.subtotalProcedures = this.procedures.reduce((sum, proc) => sum + (proc.price || 0), 0);
  this.subtotalAdmission = this.admissionFee?.price || 0;
  
  this.totalAmount = this.subtotalConsultation + this.subtotalDrugs + this.subtotalProcedures + this.subtotalAdmission;
  
  next();
});

module.exports = mongoose.model('Bill', billSchema);
