const { Alert, InventoryItem } = require('../models');
const { config } = require('../config');

class AlertService {
  async generateAlerts() {
    const alerts = [];

    const lowStockItems = await InventoryItem.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minimumStock'] },
    });

    for (const item of lowStockItems) {
      const existingAlert = await Alert.findOne({
        inventoryItem: item._id,
        type: item.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        isRead: false,
        isDismissed: false,
      });

      if (!existingAlert) {
        const alert = await Alert.create({
          type: item.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
          severity: item.quantity === 0 ? 'critical' : 'warning',
          inventoryItem: item._id,
          message: item.quantity === 0
            ? `${item.itemName} is out of stock`
            : `${item.itemName} is low on stock (${item.quantity} remaining)`,
        });
        alerts.push(alert);
      }
    }

    const now = new Date();
    const critical = new Date(now);
    critical.setDate(critical.getDate() + config.alerts.expiryWarningDays.critical);
    
    const warning = new Date(now);
    warning.setDate(warning.getDate() + config.alerts.expiryWarningDays.warning);
    
    const notice = new Date(now);
    notice.setDate(notice.getDate() + config.alerts.expiryWarningDays.notice);

    const criticalItems = await InventoryItem.find({
      isActive: true,
      expirationDate: { $gte: now, $lte: critical },
    });

    for (const item of criticalItems) {
      const existingAlert = await Alert.findOne({
        inventoryItem: item._id,
        type: 'EXPIRY_CRITICAL',
        isRead: false,
        isDismissed: false,
      });

      if (!existingAlert) {
        const daysUntilExpiry = Math.floor((item.expirationDate - now) / (1000 * 60 * 60 * 24));
        const alert = await Alert.create({
          type: 'EXPIRY_CRITICAL',
          severity: 'critical',
          inventoryItem: item._id,
          message: `${item.itemName} expires in ${daysUntilExpiry} days (${item.expirationDate.toLocaleDateString()})`,
        });
        alerts.push(alert);
      }
    }

    const warningItems = await InventoryItem.find({
      isActive: true,
      expirationDate: { $gt: critical, $lte: warning },
    });

    for (const item of warningItems) {
      const existingAlert = await Alert.findOne({
        inventoryItem: item._id,
        type: 'EXPIRY_WARNING',
        isRead: false,
        isDismissed: false,
      });

      if (!existingAlert) {
        const daysUntilExpiry = Math.floor((item.expirationDate - now) / (1000 * 60 * 60 * 24));
        const alert = await Alert.create({
          type: 'EXPIRY_WARNING',
          severity: 'warning',
          inventoryItem: item._id,
          message: `${item.itemName} expires in ${daysUntilExpiry} days (${item.expirationDate.toLocaleDateString()})`,
        });
        alerts.push(alert);
      }
    }

    const noticeItems = await InventoryItem.find({
      isActive: true,
      expirationDate: { $gt: warning, $lte: notice },
    });

    for (const item of noticeItems) {
      const existingAlert = await Alert.findOne({
        inventoryItem: item._id,
        type: 'EXPIRY_NOTICE',
        isRead: false,
        isDismissed: false,
      });

      if (!existingAlert) {
        const daysUntilExpiry = Math.floor((item.expirationDate - now) / (1000 * 60 * 60 * 24));
        const alert = await Alert.create({
          type: 'EXPIRY_NOTICE',
          severity: 'notice',
          inventoryItem: item._id,
          message: `${item.itemName} expires in ${daysUntilExpiry} days (${item.expirationDate.toLocaleDateString()})`,
        });
        alerts.push(alert);
      }
    }

    return alerts;
  }

  async getAlerts(filters = {}) {
    const query = {};

    if (filters.severity) {
      query.severity = filters.severity;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.unreadOnly === 'true') {
      query.isRead = false;
    }

    if (filters.activOnly === 'true') {
      query.isDismissed = false;
    }

    const alerts = await Alert.find(query)
      .populate('inventoryItem')
      .sort({ severity: -1, createdAt: -1 });

    return alerts;
  }

  async markAsRead(alertId) {
    const alert = await Alert.findById(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.isRead = true;
    alert.readAt = new Date();
    await alert.save();

    return alert;
  }

  async dismissAlert(alertId) {
    const alert = await Alert.findById(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.isDismissed = true;
    alert.dismissedAt = new Date();
    await alert.save();

    return alert;
  }

  async getAlertStats() {
    const stats = await Alert.aggregate([
      { $match: { isDismissed: false } },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      critical: 0,
      warning: 0,
      notice: 0,
    };

    stats.forEach(stat => {
      result.total += stat.count;
      result[stat._id] = stat.count;
    });

    return result;
  }
}

module.exports = new AlertService();
