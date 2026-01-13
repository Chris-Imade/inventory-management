const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');
const { config } = require('../config');

class PrinterService {
  constructor() {
    this.enabled = config.printer.enabled;
    this.printer = null;
    
    if (this.enabled) {
      this.initializePrinter();
    }
  }

  initializePrinter() {
    try {
      this.printer = new ThermalPrinter({
        type: PrinterTypes[config.printer.type.toUpperCase()] || PrinterTypes.EPSON,
        interface: config.printer.interface,
        characterSet: CharacterSet.PC852_LATIN2,
        width: config.printer.width,
        removeSpecialCharacters: false,
        lineCharacter: '=',
      });
    } catch (error) {
      console.error('Failed to initialize thermal printer:', error.message);
      this.enabled = false;
    }
  }

  getStatus() {
    return {
      connected: this.enabled && this.printer !== null,
      printer: this.enabled ? {
        name: config.printer.name || 'Thermal Printer',
        model: config.printer.type || 'EPSON',
        location: config.printer.interface || 'USB',
        status: 'Online'
      } : null
    };
  }

  async testPrint() {
    if (!this.enabled || !this.printer) {
      return {
        success: false,
        message: 'Printer not connected'
      };
    }

    try {
      this.printer.clear();
      this.printer.alignCenter();
      this.printer.bold(true);
      this.printer.println('TEST PRINT');
      this.printer.bold(false);
      this.printer.println('');
      this.printer.println('Printer is working correctly!');
      this.printer.println('');
      this.printer.println(new Date().toLocaleString());
      this.printer.println('');
      this.printer.drawLine();
      this.printer.cut();
      
      await this.printer.execute();
      
      return {
        success: true,
        message: 'Test print sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async printReceipt(transaction, clinic) {
    if (!this.enabled || !this.printer) {
      return this.generateReceiptText(transaction, clinic);
    }

    try {
      this.printer.clear();
      
      this.printer.alignCenter();
      this.printer.setTextSize(1, 1);
      this.printer.bold(true);
      this.printer.println(clinic.name || 'Medical Clinic');
      this.printer.bold(false);
      this.printer.setTextNormal();
      
      if (clinic.address) {
        this.printer.println(clinic.address);
      }
      if (clinic.phone) {
        this.printer.println(`Tel: ${clinic.phone}`);
      }
      if (clinic.email) {
        this.printer.println(`Email: ${clinic.email}`);
      }
      
      this.printer.drawLine();
      
      this.printer.alignLeft();
      this.printer.println(`Transaction ID: ${transaction.transactionId}`);
      this.printer.println(`Date: ${new Date(transaction.createdAt).toLocaleString()}`);
      this.printer.println(`Status: ${transaction.status}`);
      
      if (transaction.patientName) {
        this.printer.println(`Patient: ${transaction.patientName}`);
      }
      if (transaction.patientId) {
        this.printer.println(`Patient ID: ${transaction.patientId}`);
      }
      if (transaction.prescriptionNumber) {
        this.printer.println(`Prescription: ${transaction.prescriptionNumber}`);
      }
      
      this.printer.drawLine();
      
      this.printer.bold(true);
      this.printer.tableCustom([
        { text: 'Item', align: 'LEFT', width: 0.5 },
        { text: 'Qty', align: 'CENTER', width: 0.15 },
        { text: 'Price', align: 'RIGHT', width: 0.15 },
        { text: 'Total', align: 'RIGHT', width: 0.2 },
      ]);
      this.printer.bold(false);
      this.printer.drawLine();
      
      transaction.lineItems.forEach(item => {
        const itemName = item.itemSnapshot.itemName || 'Unknown Item';
        const truncatedName = itemName.length > 20 ? itemName.substring(0, 17) + '...' : itemName;
        
        this.printer.tableCustom([
          { text: truncatedName, align: 'LEFT', width: 0.5 },
          { text: item.quantity.toString(), align: 'CENTER', width: 0.15 },
          { text: item.unitPrice.toFixed(2), align: 'RIGHT', width: 0.15 },
          { text: item.subtotal.toFixed(2), align: 'RIGHT', width: 0.2 },
        ]);
        
        if (item.itemSnapshot.batchNumber) {
          this.printer.println(`  Batch: ${item.itemSnapshot.batchNumber}`);
        }
      });
      
      this.printer.drawLine();
      
      this.printer.bold(true);
      this.printer.setTextSize(1, 1);
      this.printer.tableCustom([
        { text: 'TOTAL:', align: 'LEFT', width: 0.65 },
        { text: `$${transaction.totalAmount.toFixed(2)}`, align: 'RIGHT', width: 0.35 },
      ]);
      this.printer.setTextNormal();
      this.printer.bold(false);
      
      this.printer.drawLine();
      
      this.printer.println(`Payment: ${transaction.paymentMethod.toUpperCase()}`);
      
      if (transaction.status === 'CANCELLED') {
        this.printer.newLine();
        this.printer.bold(true);
        this.printer.alignCenter();
        this.printer.println('*** CANCELLED ***');
        this.printer.alignLeft();
        this.printer.bold(false);
        this.printer.println(`Cancelled: ${new Date(transaction.cancelledAt).toLocaleString()}`);
        this.printer.println(`Reason: ${transaction.cancellationReason}`);
      }
      
      if (transaction.notes) {
        this.printer.newLine();
        this.printer.println(`Notes: ${transaction.notes}`);
      }
      
      this.printer.newLine();
      this.printer.alignCenter();
      this.printer.println('Thank you for your visit!');
      this.printer.println('Please keep this receipt for your records');
      
      this.printer.cut();
      
      await this.printer.execute();
      
      return { success: true, message: 'Receipt printed successfully' };
      
    } catch (error) {
      console.error('Print error:', error);
      return { success: false, message: error.message };
    }
  }

  generateReceiptText(transaction, clinic) {
    let receipt = '\n';
    receipt += '='.repeat(48) + '\n';
    receipt += `${(clinic.name || 'Medical Clinic').padStart(24 + clinic.name.length / 2)}\n`;
    receipt += `${(clinic.address || '').padStart(24 + (clinic.address?.length || 0) / 2)}\n`;
    if (clinic.phone) receipt += `Tel: ${clinic.phone}\n`;
    if (clinic.email) receipt += `Email: ${clinic.email}\n`;
    receipt += '='.repeat(48) + '\n';
    receipt += `Transaction ID: ${transaction.transactionId}\n`;
    receipt += `Date: ${new Date(transaction.createdAt).toLocaleString()}\n`;
    receipt += `Status: ${transaction.status}\n`;
    if (transaction.patientName) receipt += `Patient: ${transaction.patientName}\n`;
    if (transaction.patientId) receipt += `Patient ID: ${transaction.patientId}\n`;
    if (transaction.prescriptionNumber) receipt += `Prescription: ${transaction.prescriptionNumber}\n`;
    receipt += '='.repeat(48) + '\n';
    receipt += 'Item                    Qty   Price    Total\n';
    receipt += '-'.repeat(48) + '\n';
    
    transaction.lineItems.forEach(item => {
      const name = (item.itemSnapshot.itemName || 'Unknown').substring(0, 20).padEnd(20);
      const qty = item.quantity.toString().padStart(5);
      const price = item.unitPrice.toFixed(2).padStart(7);
      const total = item.subtotal.toFixed(2).padStart(8);
      receipt += `${name} ${qty} ${price} ${total}\n`;
      if (item.itemSnapshot.batchNumber) {
        receipt += `  Batch: ${item.itemSnapshot.batchNumber}\n`;
      }
    });
    
    receipt += '='.repeat(48) + '\n';
    receipt += `TOTAL: $${transaction.totalAmount.toFixed(2)}`.padStart(48) + '\n';
    receipt += '='.repeat(48) + '\n';
    receipt += `Payment: ${transaction.paymentMethod.toUpperCase()}\n`;
    
    if (transaction.status === 'CANCELLED') {
      receipt += '\n*** CANCELLED ***\n';
      receipt += `Cancelled: ${new Date(transaction.cancelledAt).toLocaleString()}\n`;
      receipt += `Reason: ${transaction.cancellationReason}\n`;
    }
    
    if (transaction.notes) {
      receipt += `\nNotes: ${transaction.notes}\n`;
    }
    
    receipt += '\nThank you for your visit!\n';
    receipt += 'Please keep this receipt for your records\n';
    receipt += '='.repeat(48) + '\n\n';
    
    return { success: true, text: receipt };
  }

  async printDailySummary(summary, clinic) {
    const text = this.generateDailySummaryText(summary, clinic);
    
    if (!this.enabled || !this.printer) {
      return text;
    }

    try {
      this.printer.clear();
      this.printer.alignCenter();
      this.printer.bold(true);
      this.printer.println('DAILY SUMMARY REPORT');
      this.printer.bold(false);
      this.printer.println(clinic.name || 'Medical Clinic');
      this.printer.println(new Date().toLocaleDateString());
      this.printer.drawLine();
      
      this.printer.alignLeft();
      this.printer.println(`Total Transactions: ${summary.totalTransactions}`);
      this.printer.println(`Completed: ${summary.completed}`);
      this.printer.println(`Cancelled: ${summary.cancelled}`);
      this.printer.drawLine();
      this.printer.bold(true);
      this.printer.println(`Total Revenue: $${summary.totalRevenue.toFixed(2)}`);
      this.printer.bold(false);
      this.printer.drawLine();
      
      this.printer.cut();
      await this.printer.execute();
      
      return { success: true, message: 'Summary printed successfully' };
    } catch (error) {
      console.error('Print error:', error);
      return { success: false, message: error.message, text: text.text };
    }
  }

  generateDailySummaryText(summary, clinic) {
    let text = '\n';
    text += '='.repeat(48) + '\n';
    text += 'DAILY SUMMARY REPORT\n';
    text += `${clinic.name || 'Medical Clinic'}\n`;
    text += `${new Date().toLocaleDateString()}\n`;
    text += '='.repeat(48) + '\n';
    text += `Total Transactions: ${summary.totalTransactions}\n`;
    text += `Completed: ${summary.completed}\n`;
    text += `Cancelled: ${summary.cancelled}\n`;
    text += '='.repeat(48) + '\n';
    text += `Total Revenue: $${summary.totalRevenue.toFixed(2)}\n`;
    text += '='.repeat(48) + '\n\n';
    
    return { success: true, text };
  }
}

module.exports = new PrinterService();
