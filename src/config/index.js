require('dotenv').config();

const validateEnv = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'SESSION_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  appName: process.env.APP_NAME || 'Medical Inventory Management System',
  
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  session: {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    },
  },
  
  admin: {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  },
  
  clinic: {
    name: process.env.CLINIC_NAME || 'Medical Clinic',
    address: process.env.CLINIC_ADDRESS || '',
    phone: process.env.CLINIC_PHONE || '',
    email: process.env.CLINIC_EMAIL || '',
  },
  
  alerts: {
    lowStockThreshold: parseInt(process.env.LOW_STOCK_THRESHOLD, 10) || 10,
    expiryWarningDays: {
      critical: parseInt(process.env.EXPIRY_WARNING_DAYS_30, 10) || 30,
      warning: parseInt(process.env.EXPIRY_WARNING_DAYS_60, 10) || 60,
      notice: parseInt(process.env.EXPIRY_WARNING_DAYS_90, 10) || 90,
    },
  },
  
  printer: {
    enabled: process.env.PRINTER_ENABLED === 'true',
    type: process.env.PRINTER_TYPE || 'epson',
    interface: process.env.PRINTER_INTERFACE || 'usb',
    width: parseInt(process.env.PRINTER_WIDTH, 10) || 48,
  },
  
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
  
  currency: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
  },
};

module.exports = { config, validateEnv };
