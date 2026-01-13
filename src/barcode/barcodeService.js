const bwipjs = require('bwip-js');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const generateBarcodeValue = (prefix = 'MED') => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
};

const generateBarcode = async (value, type = 'code128') => {
  try {
    const png = await bwipjs.toBuffer({
      bcid: type,
      text: value,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });
    
    return {
      value,
      image: png.toString('base64'),
      type,
    };
  } catch (error) {
    throw new Error(`Barcode generation failed: ${error.message}`);
  }
};

const generateQRCode = async (value) => {
  try {
    const qrCode = await QRCode.toDataURL(value, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    return {
      value,
      image: qrCode,
      type: 'qr',
    };
  } catch (error) {
    throw new Error(`QR code generation failed: ${error.message}`);
  }
};

const validateBarcodeFormat = (barcode) => {
  if (!barcode || typeof barcode !== 'string') {
    return false;
  }
  
  const cleanBarcode = barcode.trim();
  
  if (cleanBarcode.length < 4 || cleanBarcode.length > 50) {
    return false;
  }
  
  return /^[A-Z0-9\-_]+$/i.test(cleanBarcode);
};

const generateBarcodeForItem = async (itemData) => {
  const barcodeValue = itemData.barcode || generateBarcodeValue('MED');
  
  const barcode = await generateBarcode(barcodeValue);
  const qrCode = await generateQRCode(JSON.stringify({
    barcode: barcodeValue,
    sku: itemData.sku,
    name: itemData.itemName,
  }));
  
  return {
    barcode,
    qrCode,
    value: barcodeValue,
  };
};

module.exports = {
  generateBarcodeValue,
  generateBarcode,
  generateQRCode,
  validateBarcodeFormat,
  generateBarcodeForItem,
};
