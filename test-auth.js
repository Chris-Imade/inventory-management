require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./src/models');

async function testAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');
    
    // Get the admin user
    const user = await User.findOne({ username: process.env.ADMIN_USERNAME || 'admin' });
    
    if (!user) {
      console.log('❌ User not found in database');
      process.exit(1);
    }
    
    console.log('User found:');
    console.log('- Username:', user.username);
    console.log('- Password (full hash):', user.password);
    console.log('- Hash starts with $2a$ (bcrypt):', user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
    console.log('- isActive:', user.isActive);
    console.log('');
    
    // Test password comparison
    const testPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    console.log('Testing with password from .env:', testPassword);
    console.log('Password length:', testPassword.length);
    console.log('');
    
    const isMatch = await user.comparePassword(testPassword);
    console.log('Password match:', isMatch ? '✓ YES' : '❌ NO');
    
    // Also test some common passwords
    console.log('\nTrying common test passwords:');
    const testPasswords = ['admin', 'Admin123!', 'password', 'AdminOnlyPass'];
    for (const pwd of testPasswords) {
      const match = await user.comparePassword(pwd);
      if (match) {
        console.log(`✓ MATCH FOUND: "${pwd}"`);
      }
    }
    
    if (!isMatch) {
      console.log('\n❌ Password does not match!');
      console.log('This means either:');
      console.log('1. The password in .env is different from what was seeded');
      console.log('2. There is an issue with password hashing/comparison');
    } else {
      console.log('\n✅ Password matches! Authentication should work.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testAuth();
