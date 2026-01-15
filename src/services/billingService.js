const { Bill, Procedure, InventoryItem } = require('../models');
const { AppError } = require('../utils/errorHandler');

class BillingService {
  async generateBillNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const prefix = `BILL-${year}${month}${day}`;
    const lastBill = await Bill.findOne({ billNumber: new RegExp(`^${prefix}`) })
      .sort({ billNumber: -1 })
      .limit(1);
    
    let sequence = 1;
    if (lastBill) {
      const lastSequence = parseInt(lastBill.billNumber.split('-').pop());
      sequence = lastSequence + 1;
    }
    
    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  async createOrUpdateBill(billId, data, userId) {
    let bill;
    
    if (billId) {
      bill = await Bill.findById(billId);
      if (!bill) {
        throw new AppError('Bill not found', 404);
      }
    } else {
      const billNumber = await this.generateBillNumber();
      bill = new Bill({
        billNumber,
        createdBy: userId,
      });
    }
    
    if (data.patientName) bill.patientName = data.patientName;
    if (data.patientId) bill.patientId = data.patientId;
    if (data.cardType) bill.cardType = data.cardType;
    if (data.consultation) bill.consultation = data.consultation;
    if (data.drugs) bill.drugs = data.drugs;
    if (data.procedures) bill.procedures = data.procedures;
    if (data.admissionFee) bill.admissionFee = data.admissionFee;
    if (data.notes) bill.notes = data.notes;
    
    await bill.save();
    return bill;
  }

  async getBillById(billId) {
    const bill = await Bill.findById(billId)
      .populate('drugs.drugId')
      .populate('procedures.procedureId')
      .populate('createdBy', 'username');
    
    if (!bill) {
      throw new AppError('Bill not found', 404);
    }
    
    return bill;
  }

  async getAllBills(filters = {}) {
    const query = {};
    
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.patientId) {
      query.patientId = filters.patientId;
    }
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }
    
    const bills = await Bill.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    
    return bills;
  }

  async updateBillStatus(billId, status, userId) {
    const bill = await Bill.findById(billId);
    if (!bill) {
      throw new AppError('Bill not found', 404);
    }
    
    bill.status = status;
    
    if (status === 'PAID') {
      bill.paidAt = new Date();
      
      if (bill.drugs && bill.drugs.length > 0) {
        for (const drug of bill.drugs) {
          if (drug.drugId) {
            const item = await InventoryItem.findById(drug.drugId);
            if (item) {
              const totalUnits = drug.numberOfUnits * drug.numberOfDays;
              item.quantity -= totalUnits;
              
              if (item.quantity < 0) {
                throw new AppError(`Insufficient stock for ${drug.drugName}`, 400);
              }
              
              await item.save();
            }
          }
        }
      }
    } else if (status === 'CANCELLED') {
      bill.cancelledAt = new Date();
    }
    
    await bill.save();
    return bill;
  }

  async deleteBill(billId) {
    const bill = await Bill.findById(billId);
    if (!bill) {
      throw new AppError('Bill not found', 404);
    }
    
    if (bill.status === 'PAID') {
      throw new AppError('Cannot delete a paid bill', 400);
    }
    
    await bill.deleteOne();
    return { message: 'Bill deleted successfully' };
  }

  async getAllProcedures(search = '') {
    const query = { isActive: true };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const procedures = await Procedure.find(query).sort({ name: 1 });
    return procedures;
  }

  async createProcedure(data) {
    const procedure = new Procedure(data);
    await procedure.save();
    return procedure;
  }

  async searchDrugs(search = '') {
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }
    
    const drugs = await InventoryItem.find(query)
      .select('itemName sku barcode sellingPrice quantity')
      .limit(20);
    
    return drugs;
  }

  getCumulativeBillData(bill, section) {
    const data = {
      billNumber: bill.billNumber,
      patientName: bill.patientName,
      patientId: bill.patientId,
      createdAt: bill.createdAt,
      sections: [],
      subtotal: 0,
      total: 0,
    };
    
    const sections = ['cards', 'consultation', 'drugs', 'procedures', 'admission'];
    const sectionIndex = sections.indexOf(section);
    
    if (sectionIndex === -1) {
      throw new AppError('Invalid section', 400);
    }
    
    if (bill.cardType && sectionIndex >= 0) {
      data.sections.push({
        name: 'Card',
        items: [{ name: bill.cardType, price: 0 }],
        subtotal: 0,
      });
    }
    
    if (bill.consultation && sectionIndex >= 1) {
      const consultationTotal = bill.consultation.price + (bill.consultation.emergencyFee || 0);
      const items = [
        { name: bill.consultation.type, price: bill.consultation.price }
      ];
      
      if (bill.consultation.isEmergency) {
        items.push({ name: 'Emergency Fee', price: bill.consultation.emergencyFee });
      }
      
      data.sections.push({
        name: 'Consultation',
        items,
        subtotal: consultationTotal,
      });
      data.subtotal += consultationTotal;
    }
    
    if (bill.drugs && bill.drugs.length > 0 && sectionIndex >= 2) {
      const drugItems = bill.drugs.map(drug => ({
        name: drug.drugName,
        details: `${drug.numberOfUnits} units × ${drug.numberOfDays} days (${drug.timesDaily}, ${drug.duration})`,
        price: drug.subtotal,
      }));
      
      data.sections.push({
        name: 'Drugs / Consumables',
        items: drugItems,
        subtotal: bill.subtotalDrugs,
      });
      data.subtotal += bill.subtotalDrugs;
    }
    
    if (bill.procedures && bill.procedures.length > 0 && sectionIndex >= 3) {
      const procedureItems = bill.procedures.map(proc => ({
        name: proc.procedureName,
        price: proc.price,
      }));
      
      data.sections.push({
        name: 'Procedures',
        items: procedureItems,
        subtotal: bill.subtotalProcedures,
      });
      data.subtotal += bill.subtotalProcedures;
    }
    
    if (bill.admissionFee && sectionIndex >= 4) {
      data.sections.push({
        name: 'Admission Fee',
        items: [{ name: bill.admissionFee.type, price: bill.admissionFee.price }],
        subtotal: bill.subtotalAdmission,
      });
      data.subtotal += bill.subtotalAdmission;
    }
    
    data.total = data.subtotal;
    
    return data;
  }
}

module.exports = new BillingService();
