const mongoose = require('mongoose');
const { config } = require('../config');

let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(config.mongodb.uri, options);
    
    isConnected = true;
    console.log('✓ MongoDB Atlas connected successfully');
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      isConnected = false;
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
};

const disconnectDatabase = async () => {
  if (!isConnected) {
    return;
  }
  
  await mongoose.connection.close();
  isConnected = false;
  console.log('MongoDB connection closed');
};

module.exports = { connectDatabase, disconnectDatabase };
