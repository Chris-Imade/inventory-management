const PDFDocument = require('pdfkit');
const { InventoryItem, Transaction } = require('../models');
const { config } = require('../config');

class ReportService {
  async generateInventoryReport(filters = {}) {
    const query = { isActive: true };
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$minimumStock'] };
    }

    const items = await InventoryItem.find(query).sort({ category: 1, itemName: 1 });
    
    const summary = {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
      categories: {},
    };

    items.forEach(item => {
      if (!summary.categories[item.category]) {
        summary.categories[item.category] = {
          count: 0,
          value: 0,
        };
      }
      summary.categories[item.category].count++;
      summary.categories[item.category].value += item.quantity * item.unitPrice;
    });

    return {
      items,
      summary,
      generatedAt: new Date(),
    };
  }

  async generateTransactionReport(startDate, endDate) {
    const query = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('lineItems.inventoryItem')
      .sort({ createdAt: -1 });

    const summary = {
      totalTransactions: transactions.length,
      completed: transactions.filter(t => t.status === 'COMPLETED').length,
      cancelled: transactions.filter(t => t.status === 'CANCELLED').length,
      totalRevenue: transactions
        .filter(t => t.status === 'COMPLETED')
        .reduce((sum, t) => sum + t.totalAmount, 0),
      cancelledAmount: transactions
        .filter(t => t.status === 'CANCELLED')
        .reduce((sum, t) => sum + t.totalAmount, 0),
    };

    return {
      transactions,
      summary,
      generatedAt: new Date(),
      period: { startDate, endDate },
    };
  }

  async generateLowStockReport() {
    const items = await InventoryItem.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minimumStock'] },
    }).sort({ quantity: 1 });

    return {
      items,
      count: items.length,
      generatedAt: new Date(),
    };
  }

  async generateExpiryReport(days = 90) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const expiringItems = await InventoryItem.find({
      isActive: true,
      expirationDate: {
        $gte: now,
        $lte: futureDate,
      },
    }).sort({ expirationDate: 1 });

    const expiredItems = await InventoryItem.find({
      isActive: true,
      expirationDate: { $lt: now },
    }).sort({ expirationDate: 1 });

    return {
      expiringItems,
      expiredItems,
      expiringCount: expiringItems.length,
      expiredCount: expiredItems.length,
      generatedAt: new Date(),
      days,
    };
  }

  async generatePDFReport(reportData, reportType) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text(config.clinic.name || 'Medical Clinic', { align: 'center' });
      doc.fontSize(10).text(config.clinic.address || '', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(16).text(`${reportType} Report`, { align: 'center' });
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown();

      if (reportType === 'Inventory') {
        this.addInventoryToPDF(doc, reportData);
      } else if (reportType === 'Transaction') {
        this.addTransactionsToPDF(doc, reportData);
      } else if (reportType === 'Low Stock') {
        this.addLowStockToPDF(doc, reportData);
      } else if (reportType === 'Expiry') {
        this.addExpiryToPDF(doc, reportData);
      }

      doc.end();
    });
  }

  addInventoryToPDF(doc, data) {
    doc.fontSize(12).text('Summary', { underline: true });
    doc.fontSize(10).text(`Total Items: ${data.summary.totalItems}`);
    doc.text(`Total Value: $${data.summary.totalValue.toFixed(2)}`);
    doc.moveDown();

    doc.fontSize(12).text('Items by Category', { underline: true });
    Object.entries(data.summary.categories).forEach(([category, stats]) => {
      doc.fontSize(10).text(`${category}: ${stats.count} items, $${stats.value.toFixed(2)}`);
    });
    doc.moveDown();

    doc.fontSize(12).text('Inventory Items', { underline: true });
    data.items.slice(0, 50).forEach(item => {
      doc.fontSize(9).text(
        `${item.itemName} (${item.sku}) - Qty: ${item.quantity} - $${item.sellingPrice.toFixed(2)}`
      );
    });
  }

  addTransactionsToPDF(doc, data) {
    doc.fontSize(12).text('Summary', { underline: true });
    doc.fontSize(10).text(`Total Transactions: ${data.summary.totalTransactions}`);
    doc.text(`Completed: ${data.summary.completed}`);
    doc.text(`Cancelled: ${data.summary.cancelled}`);
    doc.text(`Total Revenue: $${data.summary.totalRevenue.toFixed(2)}`);
    doc.moveDown();

    doc.fontSize(12).text('Recent Transactions', { underline: true });
    data.transactions.slice(0, 30).forEach(txn => {
      doc.fontSize(9).text(
        `${txn.transactionId} - ${new Date(txn.createdAt).toLocaleDateString()} - $${txn.totalAmount.toFixed(2)} - ${txn.status}`
      );
    });
  }

  addLowStockToPDF(doc, data) {
    doc.fontSize(12).text(`Low Stock Items (${data.count})`, { underline: true });
    doc.moveDown();

    data.items.forEach(item => {
      doc.fontSize(9).text(
        `${item.itemName} (${item.sku}) - Qty: ${item.quantity} / Min: ${item.minimumStock}`
      );
    });
  }

  addExpiryToPDF(doc, data) {
    doc.fontSize(12).text(`Expired Items (${data.expiredCount})`, { underline: true });
    data.expiredItems.forEach(item => {
      doc.fontSize(9).text(
        `${item.itemName} - Expired: ${item.expirationDate.toLocaleDateString()}`
      );
    });
    doc.moveDown();

    doc.fontSize(12).text(`Expiring Soon (${data.expiringCount})`, { underline: true });
    data.expiringItems.forEach(item => {
      doc.fontSize(9).text(
        `${item.itemName} - Expires: ${item.expirationDate.toLocaleDateString()}`
      );
    });
  }

  generateCSV(data, type) {
    if (type === 'inventory') {
      let csv = 'Item Name,SKU,Barcode,Category,Quantity,Unit Price,Selling Price,Expiration Date\n';
      data.items.forEach(item => {
        csv += `"${item.itemName}","${item.sku}","${item.barcode || ''}","${item.category}",${item.quantity},${item.unitPrice},${item.sellingPrice},"${item.expirationDate ? item.expirationDate.toISOString() : ''}"\n`;
      });
      return csv;
    } else if (type === 'transaction') {
      let csv = 'Transaction ID,Date,Status,Total Amount,Payment Method,Patient Name\n';
      data.transactions.forEach(txn => {
        csv += `"${txn.transactionId}","${new Date(txn.createdAt).toISOString()}","${txn.status}",${txn.totalAmount},"${txn.paymentMethod}","${txn.patientName || ''}"\n`;
      });
      return csv;
    }
    return '';
  }
}

module.exports = new ReportService();
