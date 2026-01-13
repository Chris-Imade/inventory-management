const { connectDatabase, disconnectDatabase } = require('./connection');
const { User, InventoryItem, Transaction, Alert } = require('../models');
const { config } = require('../config');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');
    
    await connectDatabase();

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await InventoryItem.deleteMany({});
    await Transaction.deleteMany({});
    await Alert.deleteMany({});

    console.log('Creating admin user...');
    const user = await User.create({
      username: config.admin.username,
      password: config.admin.password,
      isActive: true,
    });
    console.log(`✓ Admin user created: ${user.username}`);

    console.log('Creating sample inventory items...');
    const sampleItems = [
      {
        itemName: 'Paracetamol 500mg Tablets',
        sku: 'MED-PARA-500',
        barcode: 'MED170000001234',
        batchNumber: 'BATCH-2024-001',
        expirationDate: new Date('2025-12-31'),
        quantity: 500,
        unitType: 'strip',
        category: 'medication',
        subcategory: 'Analgesics',
        description: 'Pain relief and fever reducer',
        manufacturer: 'PharmaCorp',
        supplier: 'MedSupply Ltd',
        unitPrice: 150,
        sellingPrice: 300,
        minimumStock: 100,
        storageLocation: 'Shelf A1',
        requiresPrescription: false,
      },
      {
        itemName: 'Amoxicillin 250mg Capsules',
        sku: 'MED-AMOX-250',
        barcode: 'MED170000005678',
        batchNumber: 'BATCH-2024-002',
        expirationDate: new Date('2025-06-30'),
        quantity: 200,
        unitType: 'strip',
        category: 'medication',
        subcategory: 'Antibiotics',
        description: 'Antibiotic for bacterial infections',
        manufacturer: 'PharmaCorp',
        supplier: 'MedSupply Ltd',
        unitPrice: 800,
        sellingPrice: 1500,
        minimumStock: 50,
        storageLocation: 'Shelf A2',
        requiresPrescription: true,
      },
      {
        itemName: 'Digital Thermometer',
        sku: 'EQP-THERM-001',
        barcode: 'MED170000009012',
        quantity: 25,
        unitType: 'piece',
        category: 'equipment',
        subcategory: 'Diagnostic',
        description: 'Digital oral/axillary thermometer',
        manufacturer: 'MedTech Inc',
        supplier: 'MedSupply Ltd',
        unitPrice: 2000,
        sellingPrice: 4500,
        minimumStock: 10,
        storageLocation: 'Cabinet B1',
        requiresPrescription: false,
      },
      {
        itemName: 'Surgical Gloves (Box of 100)',
        sku: 'CON-GLOVE-100',
        barcode: 'MED170000003456',
        batchNumber: 'BATCH-2024-003',
        expirationDate: new Date('2026-12-31'),
        quantity: 50,
        unitType: 'box',
        category: 'consumables',
        subcategory: 'PPE',
        description: 'Latex-free surgical gloves, size M',
        manufacturer: 'SafetyFirst',
        supplier: 'MedSupply Ltd',
        unitPrice: 3500,
        sellingPrice: 6000,
        minimumStock: 20,
        storageLocation: 'Storage Room C',
        requiresPrescription: false,
      },
      {
        itemName: 'Insulin Syringes 1ml (Pack of 10)',
        sku: 'SUR-SYR-INS-1',
        barcode: 'MED170000007890',
        batchNumber: 'BATCH-2024-004',
        expirationDate: new Date('2027-03-31'),
        quantity: 150,
        unitType: 'pack',
        category: 'surgical',
        subcategory: 'Syringes',
        description: 'Sterile insulin syringes with ultra-fine needles',
        manufacturer: 'MedTech Inc',
        supplier: 'MedSupply Ltd',
        unitPrice: 1200,
        sellingPrice: 2500,
        minimumStock: 30,
        storageLocation: 'Refrigerated Section',
        requiresPrescription: false,
      },
      {
        itemName: 'Blood Glucose Test Strips (50 strips)',
        sku: 'DIA-GLU-STRIP-50',
        barcode: 'MED170000002345',
        batchNumber: 'BATCH-2024-005',
        expirationDate: new Date('2025-09-30'),
        quantity: 80,
        unitType: 'box',
        category: 'diagnostic',
        subcategory: 'Glucose Monitoring',
        description: 'Compatible with standard glucose meters',
        manufacturer: 'DiabetesCare',
        supplier: 'MedSupply Ltd',
        unitPrice: 6000,
        sellingPrice: 12000,
        minimumStock: 25,
        storageLocation: 'Shelf D1',
        requiresPrescription: false,
      },
      {
        itemName: 'Ibuprofen 400mg Tablets',
        sku: 'MED-IBU-400',
        barcode: 'MED170000006789',
        batchNumber: 'BATCH-2024-006',
        expirationDate: new Date('2024-03-31'),
        quantity: 8,
        unitType: 'strip',
        category: 'medication',
        subcategory: 'Anti-inflammatory',
        description: 'NSAID for pain and inflammation',
        manufacturer: 'PharmaCorp',
        supplier: 'MedSupply Ltd',
        unitPrice: 250,
        sellingPrice: 500,
        minimumStock: 50,
        storageLocation: 'Shelf A1',
        requiresPrescription: false,
      },
      {
        itemName: 'Bandages Sterile 10cm x 10cm (Box of 50)',
        sku: 'CON-BAND-10X10',
        barcode: 'MED170000004567',
        quantity: 5,
        unitType: 'box',
        category: 'consumables',
        subcategory: 'Wound Care',
        description: 'Sterile adhesive bandages',
        manufacturer: 'WoundCare Plus',
        supplier: 'MedSupply Ltd',
        unitPrice: 4000,
        sellingPrice: 8000,
        minimumStock: 15,
        storageLocation: 'Cabinet B2',
        requiresPrescription: false,
      },
      {
        itemName: 'Vitamin C 1000mg Tablets',
        sku: 'MED-VITC-1000',
        barcode: 'MED170000008901',
        batchNumber: 'BATCH-2024-007',
        expirationDate: new Date('2026-06-30'),
        quantity: 300,
        unitType: 'bottle',
        category: 'medication',
        subcategory: 'Supplements',
        description: 'Immune system support',
        manufacturer: 'HealthPlus',
        supplier: 'MedSupply Ltd',
        unitPrice: 1800,
        sellingPrice: 3500,
        minimumStock: 50,
        storageLocation: 'Shelf A3',
        requiresPrescription: false,
      },
      {
        itemName: 'Blood Pressure Monitor',
        sku: 'EQP-BP-001',
        barcode: 'MED170000009123',
        quantity: 15,
        unitType: 'piece',
        category: 'equipment',
        subcategory: 'Diagnostic',
        description: 'Digital blood pressure monitor with LCD display',
        manufacturer: 'MedTech Inc',
        supplier: 'MedSupply Ltd',
        unitPrice: 8000,
        sellingPrice: 15000,
        minimumStock: 5,
        storageLocation: 'Cabinet B1',
        requiresPrescription: false,
      },
    ];

    const items = await InventoryItem.insertMany(sampleItems);
    console.log(`✓ Created ${items.length} sample inventory items`);

    console.log('Creating sample transactions...');
    const { v4: uuidv4 } = require('uuid');
    
    const sampleTransactions = [
      {
        transactionId: `TXN-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`,
        status: 'COMPLETED',
        lineItems: [
          {
            inventoryItem: items[0]._id,
            itemSnapshot: {
              itemName: items[0].itemName,
              sku: items[0].sku,
              barcode: items[0].barcode,
              batchNumber: items[0].batchNumber,
            },
            quantity: 2,
            unitPrice: items[0].sellingPrice,
            subtotal: items[0].sellingPrice * 2,
          },
          {
            inventoryItem: items[2]._id,
            itemSnapshot: {
              itemName: items[2].itemName,
              sku: items[2].sku,
              barcode: items[2].barcode,
            },
            quantity: 1,
            unitPrice: items[2].sellingPrice,
            subtotal: items[2].sellingPrice * 1,
          },
        ],
        totalAmount: (items[0].sellingPrice * 2) + (items[2].sellingPrice * 1),
        paymentMethod: 'cash',
        patientName: 'Adebayo Johnson',
        patientId: 'P001',
        receiptPrinted: true,
        printedAt: new Date(),
      },
      {
        transactionId: `TXN-${Date.now() + 1000}-${uuidv4().substring(0, 8).toUpperCase()}`,
        status: 'COMPLETED',
        lineItems: [
          {
            inventoryItem: items[1]._id,
            itemSnapshot: {
              itemName: items[1].itemName,
              sku: items[1].sku,
              barcode: items[1].barcode,
              batchNumber: items[1].batchNumber,
            },
            quantity: 1,
            unitPrice: items[1].sellingPrice,
            subtotal: items[1].sellingPrice * 1,
          },
        ],
        totalAmount: items[1].sellingPrice * 1,
        paymentMethod: 'card',
        patientName: 'Chioma Okafor',
        patientId: 'P002',
        prescriptionNumber: 'RX-2024-001',
        receiptPrinted: false,
      },
      {
        transactionId: `TXN-${Date.now() + 2000}-${uuidv4().substring(0, 8).toUpperCase()}`,
        status: 'CANCELLED',
        lineItems: [
          {
            inventoryItem: items[4]._id,
            itemSnapshot: {
              itemName: items[4].itemName,
              sku: items[4].sku,
              barcode: items[4].barcode,
              batchNumber: items[4].batchNumber,
            },
            quantity: 1,
            unitPrice: items[4].sellingPrice,
            subtotal: items[4].sellingPrice * 1,
          },
        ],
        totalAmount: items[4].sellingPrice * 1,
        paymentMethod: 'cash',
        patientName: 'Emeka Nwosu',
        cancelledAt: new Date(),
        cancellationReason: 'Customer changed mind',
        cancelledBy: 'admin',
      },
    ];

    const transactions = await Transaction.insertMany(sampleTransactions);
    console.log(`✓ Created ${transactions.length} sample transactions`);

    console.log('Generating alerts...');
    const sampleAlerts = [
      {
        type: 'LOW_STOCK',
        severity: 'critical',
        inventoryItem: items[6]._id,
        message: `${items[6].itemName} is low on stock (${items[6].quantity} remaining)`,
        isRead: false,
      },
      {
        type: 'LOW_STOCK',
        severity: 'warning',
        inventoryItem: items[5]._id,
        message: `${items[5].itemName} is low on stock (${items[5].quantity} remaining)`,
        isRead: false,
      },
      {
        type: 'EXPIRY_CRITICAL',
        severity: 'critical',
        inventoryItem: items[5]._id,
        message: `${items[5].itemName} expires soon (${items[5].expirationDate.toLocaleDateString()})`,
        isRead: false,
      },
    ];

    const alerts = await Alert.insertMany(sampleAlerts);
    console.log(`✓ Created ${alerts.length} alerts`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Admin user: ${user.username}`);
    console.log(`   - Inventory items: ${items.length}`);
    console.log(`   - Transactions: ${transactions.length} (${transactions.filter(t => t.status === 'COMPLETED').length} completed, ${transactions.filter(t => t.status === 'CANCELLED').length} cancelled)`);
    console.log(`   - Alerts: ${alerts.length}`);
    console.log(`   - Low stock items: ${items.filter(i => i.quantity <= i.minimumStock).length}`);
    console.log(`   - Items expiring soon: ${items.filter(i => i.expirationDate && i.expirationDate < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)).length}`);
    console.log(`\n💰 Currency: Nigerian Naira (₦)`);
    
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
