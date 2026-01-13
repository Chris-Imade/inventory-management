require('dotenv').config();
const mongoose = require('mongoose');
const { User, InventoryItem, Transaction, Alert } = require('./src/models');

// Sample data arrays for generating realistic data
const medications = [
  'Paracetamol 500mg', 'Ibuprofen 400mg', 'Amoxicillin 250mg', 'Metformin 500mg',
  'Omeprazole 20mg', 'Aspirin 75mg', 'Ciprofloxacin 500mg', 'Azithromycin 250mg',
  'Diclofenac 50mg', 'Cetirizine 10mg', 'Loratadine 10mg', 'Prednisolone 5mg',
  'Atorvastatin 20mg', 'Amlodipine 5mg', 'Lisinopril 10mg', 'Levothyroxine 100mcg',
  'Insulin Glargine 100IU', 'Salbutamol Inhaler', 'Fluticasone Nasal Spray', 'Hydrocortisone Cream'
];

const equipment = [
  'Digital Thermometer', 'Blood Pressure Monitor', 'Pulse Oximeter', 'Stethoscope',
  'Glucometer', 'Nebulizer', 'Infrared Thermometer', 'ECG Machine',
  'Wheelchair', 'Walking Stick', 'Hospital Bed', 'IV Stand',
  'Oxygen Cylinder', 'Suction Machine', 'Defibrillator', 'Surgical Lamp',
  'Examination Table', 'Medical Trolley', 'Sterilizer', 'Autoclave'
];

const consumables = [
  'Surgical Gloves', 'Face Masks', 'Syringes 5ml', 'Cotton Wool',
  'Bandages', 'Gauze Pads', 'Alcohol Swabs', 'IV Cannula',
  'Blood Collection Tubes', 'Urine Bags', 'Catheter', 'Surgical Tape',
  'Disposable Aprons', 'Hand Sanitizer', 'Disinfectant Spray', 'Tissue Paper',
  'Tongue Depressors', 'Specimen Containers', 'Plasters', 'Elastic Bandage'
];

const surgical = [
  'Surgical Scalpel', 'Forceps', 'Scissors', 'Retractor',
  'Suture Kit', 'Surgical Drapes', 'Surgical Gown', 'Surgical Mask',
  'Surgical Gloves Sterile', 'Hemostatic Forceps', 'Needle Holder', 'Surgical Blade',
  'Surgical Stapler', 'Surgical Clips', 'Surgical Sponges', 'Surgical Towels',
  'Surgical Tray', 'Surgical Light', 'Surgical Table', 'Anesthesia Kit'
];

const diagnostic = [
  'Blood Glucose Test Strips', 'Pregnancy Test Kit', 'Malaria Test Kit', 'HIV Test Kit',
  'Urinalysis Strips', 'Rapid Diagnostic Test', 'COVID-19 Test Kit', 'Hepatitis Test Kit',
  'Cholesterol Test Kit', 'Blood Type Test Kit', 'Drug Test Kit', 'Strep Test Kit',
  'Flu Test Kit', 'TB Test Kit', 'Dengue Test Kit', 'Typhoid Test Kit',
  'H. Pylori Test Kit', 'PSA Test Kit', 'Troponin Test Kit', 'D-Dimer Test Kit'
];

const manufacturers = [
  'Pfizer', 'GSK', 'Novartis', 'Roche', 'Sanofi', 'Merck', 'AstraZeneca', 'Johnson & Johnson',
  'Abbott', 'Bayer', 'Eli Lilly', 'Bristol Myers Squibb', 'Boehringer Ingelheim', 'Teva'
];

const suppliers = [
  'MedSupply Co.', 'HealthCare Distributors', 'PharmaDirect', 'MediSource Ltd',
  'Global Medical Supplies', 'Premier Healthcare', 'MedEquip Solutions', 'HealthFirst Supplies'
];

const patientNames = [
  'John Doe', 'Jane Smith', 'Michael Johnson', 'Sarah Williams', 'David Brown',
  'Emily Davis', 'James Wilson', 'Emma Martinez', 'Robert Anderson', 'Olivia Taylor',
  'William Thomas', 'Sophia Moore', 'Daniel Jackson', 'Isabella White', 'Matthew Harris',
  'Mia Martin', 'Christopher Thompson', 'Charlotte Garcia', 'Andrew Rodriguez', 'Amelia Lewis'
];

// Helper functions
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateSKU(index) {
  return `SKU-${Date.now()}-${String(index).padStart(4, '0')}`;
}

function generateBarcode(index) {
  return `${randomInt(100000000000, 999999999999)}${String(index).padStart(3, '0')}`;
}

function generateTransactionId() {
  return `TXN-${Date.now()}-${randomInt(10000, 99999).toString(16).toUpperCase()}`;
}

// Seed functions
async function seedInventoryItems() {
  console.log('Seeding Inventory Items...');
  
  const items = [];
  const categories = [
    { name: 'medication', items: medications },
    { name: 'equipment', items: equipment },
    { name: 'consumables', items: consumables },
    { name: 'surgical', items: surgical },
    { name: 'diagnostic', items: diagnostic }
  ];

  let index = 0;
  for (const category of categories) {
    for (let i = 0; i < 4; i++) {
      const itemName = category.items[i % category.items.length];
      const quantity = randomInt(0, 200);
      const minimumStock = randomInt(10, 50);
      const unitPrice = randomInt(50, 5000);
      const sellingPrice = unitPrice + randomInt(100, 2000);
      
      items.push({
        itemName,
        sku: generateSKU(index++),
        barcode: generateBarcode(index),
        batchNumber: `BATCH-2024-${String(randomInt(1, 999)).padStart(3, '0')}`,
        expirationDate: randomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2)),
        quantity,
        unitType: randomElement(['piece', 'box', 'bottle', 'vial', 'pack', 'strip', 'tube']),
        category: category.name,
        subcategory: category.name === 'medication' ? randomElement(['Tablet', 'Capsule', 'Syrup', 'Injection']) : null,
        description: `High quality ${itemName} for medical use`,
        manufacturer: randomElement(manufacturers),
        supplier: randomElement(suppliers),
        unitPrice,
        sellingPrice,
        minimumStock,
        storageLocation: `Shelf-${randomElement(['A', 'B', 'C', 'D'])}-${randomInt(1, 20)}`,
        requiresPrescription: category.name === 'medication' ? Math.random() > 0.5 : false,
        isActive: true,
        notes: Math.random() > 0.7 ? 'Handle with care' : null
      });
    }
  }

  await InventoryItem.deleteMany({});
  const created = await InventoryItem.insertMany(items);
  console.log(`✓ Created ${created.length} inventory items`);
  return created;
}

async function seedTransactions(inventoryItems) {
  console.log('Seeding Transactions...');
  
  const transactions = [];
  
  for (let i = 0; i < 20; i++) {
    const numItems = randomInt(1, 4);
    const lineItems = [];
    let totalAmount = 0;
    
    for (let j = 0; j < numItems; j++) {
      const item = randomElement(inventoryItems);
      const quantity = randomInt(1, 5);
      const unitPrice = item.sellingPrice;
      const subtotal = quantity * unitPrice;
      totalAmount += subtotal;
      
      lineItems.push({
        inventoryItem: item._id,
        itemSnapshot: {
          itemName: item.itemName,
          sku: item.sku,
          barcode: item.barcode,
          batchNumber: item.batchNumber
        },
        quantity,
        unitPrice,
        subtotal
      });
    }
    
    const status = Math.random() > 0.9 ? 'CANCELLED' : 'COMPLETED';
    const createdAt = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
    
    const transaction = {
      transactionId: generateTransactionId() + i,
      status,
      lineItems,
      totalAmount,
      paymentMethod: randomElement(['cash', 'card', 'insurance']),
      patientName: randomElement(patientNames),
      patientId: `PAT-${randomInt(10000, 99999)}`,
      prescriptionNumber: Math.random() > 0.5 ? `RX-${randomInt(100000, 999999)}` : null,
      notes: Math.random() > 0.7 ? 'Patient requested generic alternative' : null,
      receiptPrinted: Math.random() > 0.3,
      createdAt,
      updatedAt: createdAt
    };
    
    if (status === 'CANCELLED') {
      transaction.cancelledAt = new Date(createdAt.getTime() + randomInt(1, 24) * 60 * 60 * 1000);
      transaction.cancellationReason = randomElement(['Patient request', 'Stock unavailable', 'Payment issue', 'Duplicate order']);
      transaction.cancelledBy = 'admin';
    }
    
    if (transaction.receiptPrinted) {
      transaction.printedAt = new Date(createdAt.getTime() + randomInt(1, 10) * 60 * 1000);
    }
    
    transactions.push(transaction);
  }
  
  await Transaction.deleteMany({});
  const created = await Transaction.insertMany(transactions);
  console.log(`✓ Created ${created.length} transactions`);
  return created;
}

async function seedAlerts(inventoryItems) {
  console.log('Seeding Alerts...');
  
  const alerts = [];
  const alertTypes = [
    { type: 'LOW_STOCK', severity: 'warning' },
    { type: 'OUT_OF_STOCK', severity: 'critical' },
    { type: 'EXPIRY_CRITICAL', severity: 'critical' },
    { type: 'EXPIRY_WARNING', severity: 'warning' },
    { type: 'EXPIRY_NOTICE', severity: 'notice' }
  ];
  
  for (let i = 0; i < 20; i++) {
    const item = inventoryItems[i % inventoryItems.length];
    const alertType = randomElement(alertTypes);
    const isRead = Math.random() > 0.6;
    const isDismissed = isRead ? Math.random() > 0.7 : false;
    const createdAt = randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date());
    
    let message = '';
    switch (alertType.type) {
      case 'LOW_STOCK':
        message = `${item.itemName} is running low (${item.quantity} ${item.unitType}s remaining)`;
        break;
      case 'OUT_OF_STOCK':
        message = `${item.itemName} is out of stock`;
        break;
      case 'EXPIRY_CRITICAL':
        message = `${item.itemName} expires in less than 7 days`;
        break;
      case 'EXPIRY_WARNING':
        message = `${item.itemName} expires in less than 30 days`;
        break;
      case 'EXPIRY_NOTICE':
        message = `${item.itemName} expires in less than 90 days`;
        break;
    }
    
    const alert = {
      type: alertType.type,
      severity: alertType.severity,
      inventoryItem: item._id,
      message,
      isRead,
      isDismissed,
      createdAt,
      updatedAt: createdAt
    };
    
    if (isRead) {
      alert.readAt = new Date(createdAt.getTime() + randomInt(1, 48) * 60 * 60 * 1000);
    }
    
    if (isDismissed) {
      alert.dismissedAt = new Date((alert.readAt || createdAt).getTime() + randomInt(1, 24) * 60 * 60 * 1000);
    }
    
    alerts.push(alert);
  }
  
  await Alert.deleteMany({});
  const created = await Alert.insertMany(alerts);
  console.log(`✓ Created ${created.length} alerts`);
  return created;
}

async function seedUsers() {
  console.log('Seeding Users...');
  
  await User.deleteMany({});
  
  const adminUser = new User({
    username: process.env.ADMIN_USERNAME || 'admin', 
    password: process.env.ADMIN_PASSWORD || 'Admin123!', 
    isActive: true 
  });
  
  await adminUser.save();
  
  console.log(`✓ Created 1 user (Admin: ${adminUser.username})`);
  return [adminUser];
}

// Main seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB\n');
    
    // Remove all duplicates first
    console.log('🧹 Removing duplicates and clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      InventoryItem.deleteMany({}),
      Transaction.deleteMany({}),
      Alert.deleteMany({})
    ]);
    console.log('✓ Database cleared\n');
    
    // Seed data in order (some depend on others)
    await seedUsers();
    const inventoryItems = await seedInventoryItems();
    await seedTransactions(inventoryItems);
    await seedAlerts(inventoryItems);
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- Users: ${await User.countDocuments()}`);
    console.log(`- Inventory Items: ${await InventoryItem.countDocuments()}`);
    console.log(`- Transactions: ${await Transaction.countDocuments()}`);
    console.log(`- Alerts: ${await Alert.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  }
}

// Run the seed
seedDatabase();
