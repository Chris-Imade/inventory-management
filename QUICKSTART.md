# 🚀 Quick Start Guide

Get your Medical Inventory Management System up and running in 5 minutes!

---

## Prerequisites

- **Node.js** v16+ installed
- **MongoDB Atlas** account (free tier works)
- **Git** installed

---

## Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- MongoDB/Mongoose
- Express & middleware
- Barcode generation libraries
- Thermal printer support
- PDF generation
- Authentication libraries

---

## Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string

---

## Step 3: Configure Environment

Create `.env` file from template:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medical_inventory

# Security (CHANGE THESE!)
JWT_SECRET=your-random-secret-key-here
SESSION_SECRET=your-random-session-secret-here

# Admin Credentials (CHANGE THESE!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecurePassword123!

# Application
APP_PORT=3000
NODE_ENV=development

# Clinic Information
CLINIC_NAME=Your Clinic Name
CLINIC_ADDRESS=123 Medical Street, City, State
CLINIC_PHONE=+1-234-567-8900
CLINIC_EMAIL=info@yourclinic.com
```

---

## Step 4: Seed Database

```bash
npm run seed
```

This creates:
- ✅ Admin user account
- ✅ 8 sample medical inventory items
- ✅ Items with varying stock levels
- ✅ Items with different expiration dates

---

## Step 5: Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
==================================================
🏥 Medical Inventory Management System
==================================================
✓ Server running on port 3000
✓ Environment: development
✓ Database: Connected
✓ URL: http://localhost:3000
==================================================
```

---

## Step 6: Login

1. Open browser: `http://localhost:3000`
2. Click **Login** or go to `http://localhost:3000/login`
3. Use credentials from your `.env` file:
   - Username: `admin` (or what you set)
   - Password: Your password

---

## 🎯 What's Next?

### Test the API

**Get inventory stats:**
```bash
curl http://localhost:3000/api/inventory/stats
```

**Scan a barcode:**
```bash
curl -X POST http://localhost:3000/api/pos/scan \
  -H "Content-Type: application/json" \
  -d '{"barcode": "MED170000001234"}'
```

### Explore Features

1. **Dashboard** - `http://localhost:3000/dashboard`
2. **Inventory** - `http://localhost:3000/api/inventory`
3. **POS** - `http://localhost:3000/api/pos/scan`
4. **Alerts** - `http://localhost:3000/api/alerts`
5. **Reports** - `http://localhost:3000/api/reports/inventory`

### Add Your First Item

```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Aspirin 100mg",
    "sku": "MED-ASP-100",
    "category": "medication",
    "unitType": "strip",
    "quantity": 200,
    "unitPrice": 0.30,
    "sellingPrice": 0.75,
    "minimumStock": 50,
    "expirationDate": "2025-12-31"
  }'
```

### Process Your First Transaction

```bash
curl -X POST http://localhost:3000/api/pos/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "lineItems": [
      {"inventoryItem": "ITEM_ID_HERE", "quantity": 2}
    ],
    "paymentMethod": "cash",
    "patientName": "John Doe"
  }'
```

---

## 📱 Using Barcode Scanner

### USB Barcode Scanner
1. Connect scanner to computer
2. Scanner acts as keyboard input
3. Scan barcode in POS interface
4. Item automatically added to cart

### Camera-Based Scanning
Use the `/api/pos/scan` endpoint with barcode value from camera app.

---

## 🖨️ Thermal Printer Setup (Optional)

If you have a thermal printer:

1. Update `.env`:
```env
PRINTER_ENABLED=true
PRINTER_TYPE=epson
PRINTER_INTERFACE=usb
```

2. Connect printer via USB
3. Print receipt: `GET /api/transactions/:id/print`

---

## 🔧 Troubleshooting

### Cannot connect to MongoDB
- Check your connection string
- Verify IP whitelist in Atlas
- Ensure database user has correct permissions

### Port already in use
Change `APP_PORT` in `.env` to another port (e.g., 3001)

### Dependencies not installing
```bash
rm -rf node_modules package-lock.json
npm install
```

### Authentication not working
- Verify `.env` has correct credentials
- Check JWT_SECRET and SESSION_SECRET are set
- Clear browser cookies and try again

---

## 📚 Documentation

- **Full README**: `README.md`
- **API Documentation**: `API_DOCUMENTATION.md`
- **Environment Template**: `.env.example`

---

## 🎉 You're Ready!

Your medical inventory system is now running. Start by:

1. ✅ Adding your real inventory items
2. ✅ Setting up low-stock thresholds
3. ✅ Testing POS transactions
4. ✅ Generating alerts
5. ✅ Creating reports

---

## 💡 Pro Tips

- **Backup regularly**: Export MongoDB data weekly
- **Monitor alerts**: Check daily for low stock and expiring items
- **Test printing**: Verify thermal printer before going live
- **Secure credentials**: Change default admin password immediately
- **Update stock**: Use barcode scanning for faster data entry

---

## 🆘 Need Help?

- Check error logs in terminal
- Review API documentation
- Verify environment variables
- Test with Postman or curl
- Check MongoDB Atlas connection

---

**Happy Inventory Managing! 🏥**
