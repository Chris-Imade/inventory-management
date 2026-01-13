# 🏥 Medical Inventory & Records Management System

A production-ready **Medical Inventory Management System** with barcode support, POS functionality, thermal printing, and immutable transaction tracking. Built with **Node.js**, **Express**, and **MongoDB Atlas**.

---

## 🎯 Overview

This system is designed for medical clinics, pharmacies, and healthcare facilities to manage:

- **Medical-grade inventory** with expiration tracking
- **Barcode-enabled** item management and scanning
- **Point of Sale (POS)** transactions
- **Thermal/X-Printer** receipt printing (ESC/POS compatible)
- **Immutable transaction history** (audit-compliant)
- **Low-stock & expiry alerts**
- **Comprehensive reporting** with PDF/CSV exports

---

## 🔒 Core Principles

- ✅ **Single authenticated user** (no role-based access control)
- ✅ **Transactions are immutable** (COMPLETED or CANCELLED only)
- ✅ **Full audit trail** for all operations
- ✅ **Medical inventory standards** compliance
- ✅ **Data integrity** and traceability

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JWT + Express Sessions
- **Security**: Helmet, bcryptjs

### Features
- **Barcode Generation**: bwip-js, QRCode
- **Thermal Printing**: node-thermal-printer (ESC/POS)
- **PDF Reports**: PDFKit
- **Validation**: express-validator

---

## 📁 Project Structure

```
inventory-management/
├── app.js                          # Main application entry
├── package.json
├── .env.example                    # Environment template
├── src/
│   ├── config/                     # Configuration
│   │   └── index.js
│   ├── database/                   # Database setup
│   │   ├── connection.js
│   │   └── seed.js
│   ├── models/                     # Mongoose models
│   │   ├── User.js
│   │   ├── InventoryItem.js
│   │   ├── Transaction.js
│   │   ├── Alert.js
│   │   └── index.js
│   ├── controllers/                # Request handlers
│   │   └── authController.js
│   ├── services/                   # Business logic
│   │   └── printerService.js
│   ├── middleware/                 # Auth & validation
│   │   └── auth.js
│   ├── routes/                     # API routes
│   │   ├── authRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── posRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── reportRoutes.js
│   │   └── index.js
│   ├── inventory/                  # Inventory module
│   │   ├── inventoryService.js
│   │   └── inventoryController.js
│   ├── transactions/               # Transaction module
│   │   ├── transactionService.js
│   │   └── transactionController.js
│   ├── barcode/                    # Barcode generation
│   │   └── barcodeService.js
│   ├── pos/                        # Point of Sale
│   │   └── posController.js
│   ├── reports/                    # Reporting engine
│   │   ├── reportService.js
│   │   └── reportController.js
│   ├── notifications/              # Alert system
│   │   ├── alertService.js
│   │   └── alertController.js
│   └── utils/                      # Utilities
│       ├── errorHandler.js
│       └── validators.js
├── views/                          # EJS templates
│   ├── login.ejs
│   └── dashboard.ejs
└── public/                         # Static assets
    └── styles/
```

---

## 🚀 Installation & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd inventory-management
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required variables:**

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medical_inventory

# Authentication
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret-here

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisPassword123!

# Application
APP_PORT=3000
NODE_ENV=development
```

### 4. Seed Database

```bash
npm run seed
```

This creates:
- Admin user
- Sample medical inventory items
- Test data for development

### 5. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs at: `http://localhost:3000`

---

## 📊 Database Schema

### InventoryItem

```javascript
{
  itemName: String,
  sku: String (unique),
  barcode: String (unique, auto-generated),
  batchNumber: String,
  expirationDate: Date,
  quantity: Number,
  unitType: Enum,
  category: Enum,
  manufacturer: String,
  supplier: String,
  unitPrice: Number,
  sellingPrice: Number,
  minimumStock: Number,
  storageLocation: String,
  requiresPrescription: Boolean
}
```

### Transaction

```javascript
{
  transactionId: String (unique),
  status: Enum ['COMPLETED', 'CANCELLED'],
  lineItems: [{
    inventoryItem: ObjectId,
    itemSnapshot: Object,
    quantity: Number,
    unitPrice: Number,
    subtotal: Number
  }],
  totalAmount: Number,
  paymentMethod: Enum,
  patientName: String,
  patientId: String,
  prescriptionNumber: String,
  cancellationReason: String,
  cancelledAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/login              # Login
POST   /api/auth/logout             # Logout
GET    /api/auth/me                 # Get current user
POST   /api/auth/change-password    # Change password
```

### Inventory

```
GET    /api/inventory               # Get all items
GET    /api/inventory/:id           # Get item by ID
GET    /api/inventory/barcode/:code # Get item by barcode
POST   /api/inventory               # Create item
PUT    /api/inventory/:id           # Update item
DELETE /api/inventory/:id           # Deactivate item
PATCH  /api/inventory/:id/adjust    # Adjust quantity
GET    /api/inventory/low-stock     # Low stock items
GET    /api/inventory/expiring      # Expiring items
GET    /api/inventory/stats         # Inventory statistics
```

### Transactions

```
GET    /api/transactions            # Get all transactions
GET    /api/transactions/:id        # Get transaction by ID
POST   /api/transactions            # Create transaction
POST   /api/transactions/:id/cancel # Cancel transaction
GET    /api/transactions/stats      # Transaction statistics
GET    /api/transactions/:id/print  # Print receipt
```

### Point of Sale

```
POST   /api/pos/scan                # Scan barcode
GET    /api/pos/search              # Search items
POST   /api/pos/cart-summary        # Calculate cart total
POST   /api/pos/checkout            # Process transaction
```

### Alerts

```
GET    /api/alerts                  # Get all alerts
POST   /api/alerts/generate         # Generate new alerts
PATCH  /api/alerts/:id/read         # Mark as read
PATCH  /api/alerts/:id/dismiss      # Dismiss alert
GET    /api/alerts/stats            # Alert statistics
```

### Reports

```
GET    /api/reports/inventory?format=pdf|csv|json
GET    /api/reports/transactions?startDate=&endDate=&format=pdf|csv|json
GET    /api/reports/low-stock?format=pdf|json
GET    /api/reports/expiry?days=90&format=pdf|json
```

---

## 🖨️ Thermal Printer Setup

### Configuration

```env
PRINTER_ENABLED=true
PRINTER_TYPE=epson          # epson, star, tanca
PRINTER_INTERFACE=usb       # usb, network
PRINTER_WIDTH=48            # characters per line
```

### Supported Printers

- Epson TM-series
- Star Micronics
- Any ESC/POS compatible thermal printer

### Receipt Features

- Clinic/store information
- Transaction details
- Line items with quantities and prices
- Total amount
- Payment method
- Cancellation information (if applicable)

---

## 📈 Features

### Barcode System

- **Auto-generation**: Unique barcodes created for each item
- **Formats**: Code128, EAN, QR codes
- **Scanning**: USB scanner or camera support
- **Validation**: Duplicate prevention

### Transaction Management

- **Immutable records**: Transactions cannot be deleted
- **Cancellation**: Full reversal with audit trail
- **Inventory sync**: Automatic quantity adjustments
- **Receipt printing**: Thermal or text-based

### Alert System

- **Low stock**: Configurable thresholds
- **Expiry warnings**: 30/60/90 day alerts
- **Critical notifications**: Out-of-stock items
- **Auto-generation**: Scheduled alert checks

### Reporting

- **Inventory reports**: Stock levels, valuations
- **Transaction reports**: Sales, cancellations
- **Compliance reports**: Audit trails
- **Export formats**: PDF, CSV, JSON

---

## 🔐 Security

- **Password hashing**: bcryptjs
- **JWT tokens**: Secure authentication
- **Session management**: Express sessions
- **Input validation**: express-validator
- **Security headers**: Helmet.js
- **Environment variables**: Sensitive data protection

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

---

## 📝 Usage Examples

### Create Inventory Item

```javascript
POST /api/inventory
{
  "itemName": "Paracetamol 500mg",
  "sku": "MED-PARA-500",
  "category": "medication",
  "unitType": "strip",
  "quantity": 100,
  "unitPrice": 0.50,
  "sellingPrice": 1.00,
  "minimumStock": 20,
  "expirationDate": "2025-12-31"
}
```

### Process POS Transaction

```javascript
POST /api/pos/checkout
{
  "lineItems": [
    { "inventoryItem": "item_id_1", "quantity": 2 },
    { "inventoryItem": "item_id_2", "quantity": 1 }
  ],
  "paymentMethod": "cash",
  "patientName": "John Doe"
}
```

### Cancel Transaction

```javascript
POST /api/transactions/:id/cancel
{
  "cancellationReason": "Customer returned items"
}
```

---

## 🚨 Important Notes

1. **Never delete transactions** - Use cancellation instead
2. **Backup MongoDB regularly** - Critical for data integrity
3. **Monitor expiry dates** - Check alerts daily
4. **Secure credentials** - Change default admin password
5. **Test printer setup** - Before production use

---

## 📞 Support

For issues or questions:
- Check API documentation
- Review error logs
- Verify environment configuration
- Ensure MongoDB connection

---

## 📄 License

ISC

---

## 🙏 Acknowledgments

Built for medical inventory management with focus on:
- Data integrity
- Audit compliance
- User experience
- Production reliability
