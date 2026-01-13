const { Transaction, InventoryItem } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../utils/errorHandler');
const inventoryService = require('../inventory/inventoryService');

class TransactionService {
  async createTransaction(transactionData) {
    const session = await Transaction.startSession();
    session.startTransaction();

    try {
      const lineItems = [];
      let totalAmount = 0;

      for (const item of transactionData.lineItems) {
        const inventoryItem = await InventoryItem.findById(item.inventoryItem).session(session);
        
        if (!inventoryItem) {
          throw new AppError(`Inventory item not found: ${item.inventoryItem}`, 404);
        }

        if (!inventoryItem.isActive) {
          throw new AppError(`Item is not active: ${inventoryItem.itemName}`, 400);
        }

        if (inventoryItem.quantity < item.quantity) {
          throw new AppError(
            `Insufficient quantity for ${inventoryItem.itemName}. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}`,
            400
          );
        }

        const subtotal = inventoryItem.sellingPrice * item.quantity;

        lineItems.push({
          inventoryItem: inventoryItem._id,
          itemSnapshot: {
            itemName: inventoryItem.itemName,
            sku: inventoryItem.sku,
            barcode: inventoryItem.barcode,
            batchNumber: inventoryItem.batchNumber,
          },
          quantity: item.quantity,
          unitPrice: inventoryItem.sellingPrice,
          subtotal,
        });

        totalAmount += subtotal;

        inventoryItem.quantity -= item.quantity;
        await inventoryItem.save({ session });
      }

      const transaction = await Transaction.create([{
        transactionId: `TXN-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`,
        status: 'COMPLETED',
        lineItems,
        totalAmount,
        paymentMethod: transactionData.paymentMethod || 'cash',
        patientName: transactionData.patientName,
        patientId: transactionData.patientId,
        prescriptionNumber: transactionData.prescriptionNumber,
        notes: transactionData.notes,
      }], { session });

      await session.commitTransaction();
      return transaction[0];

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async cancelTransaction(transactionId, cancellationData) {
    const session = await Transaction.startSession();
    session.startTransaction();

    try {
      const transaction = await Transaction.findById(transactionId).session(session);
      
      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      if (transaction.status === 'CANCELLED') {
        throw new AppError('Transaction is already cancelled', 400);
      }

      for (const item of transaction.lineItems) {
        const inventoryItem = await InventoryItem.findById(item.inventoryItem).session(session);
        
        if (inventoryItem) {
          inventoryItem.quantity += item.quantity;
          await inventoryItem.save({ session });
        }
      }

      transaction.status = 'CANCELLED';
      transaction.cancelledAt = new Date();
      transaction.cancellationReason = cancellationData.cancellationReason;
      transaction.cancelledBy = cancellationData.cancelledBy || 'admin';
      
      await transaction.save({ session });

      await session.commitTransaction();
      return transaction;

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getTransactionById(id) {
    const transaction = await Transaction.findById(id).populate('lineItems.inventoryItem');
    
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return transaction;
  }

  async getTransactionByTransactionId(transactionId) {
    const transaction = await Transaction.findOne({ transactionId }).populate('lineItems.inventoryItem');
    
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return transaction;
  }

  async getAllTransactions(filters = {}) {
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { transactionId: { $regex: filters.search, $options: 'i' } },
        { patientName: { $regex: filters.search, $options: 'i' } },
        { patientId: { $regex: filters.search, $options: 'i' } },
        { prescriptionNumber: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    return Transaction.find(query)
      .populate('lineItems.inventoryItem', 'itemName sku barcode')
      .sort({ createdAt: -1 })
      .limit(filters.limit || 100);
  }

  async getTransactionStats(startDate, endDate) {
    const matchStage = {};
    
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    const result = {
      totalTransactions: 0,
      completed: 0,
      cancelled: 0,
      totalRevenue: 0,
      cancelledAmount: 0,
    };

    stats.forEach(stat => {
      result.totalTransactions += stat.count;
      if (stat._id === 'COMPLETED') {
        result.completed = stat.count;
        result.totalRevenue = stat.totalAmount;
      } else if (stat._id === 'CANCELLED') {
        result.cancelled = stat.count;
        result.cancelledAmount = stat.totalAmount;
      }
    });

    return result;
  }

  async getDailySummary(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.getTransactionStats(startOfDay, endOfDay);
  }
}

module.exports = new TransactionService();
