require('dotenv').config();
const mongoose = require('mongoose');
const { User, InventoryItem, Transaction, Alert } = require('./src/models');

async function unseedDatabase() {
  try {
    console.log('🧹 Starting database cleanup...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB\n');
    
    // Get admin username from environment
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    
    console.log(`Preserving admin user: ${adminUsername}`);
    console.log('Removing all other data...\n');
    
    // Delete all data except admin user
    const inventoryResult = await InventoryItem.deleteMany({});
    console.log(`✓ Deleted ${inventoryResult.deletedCount} inventory items`);
    
    const transactionResult = await Transaction.deleteMany({});
    console.log(`✓ Deleted ${transactionResult.deletedCount} transactions`);
    
    const alertResult = await Alert.deleteMany({});
    console.log(`✓ Deleted ${alertResult.deletedCount} alerts`);
    
    // Delete all users except admin
    const userResult = await User.deleteMany({ username: { $ne: adminUsername } });
    console.log(`✓ Deleted ${userResult.deletedCount} non-admin users`);
    
    // Verify admin user still exists
    const adminUser = await User.findOne({ username: adminUsername });
    if (adminUser) {
      console.log(`✓ Admin user '${adminUsername}' preserved`);
    } else {
      console.log(`⚠️  Warning: Admin user '${adminUsername}' not found in database`);
    }
    
    console.log('\n✅ Database cleanup completed successfully!');
    console.log('\nFinal Summary:');
    console.log(`- Users: ${await User.countDocuments()} (admin only)`);
    console.log(`- Inventory Items: ${await InventoryItem.countDocuments()}`);
    console.log(`- Transactions: ${await Transaction.countDocuments()}`);
    console.log(`- Alerts: ${await Alert.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  }
}

// Run the unseed
unseedDatabase();
