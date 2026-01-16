
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' }); // Try local first, then .env
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env' });

async function testConnection() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI is missing from environment variables');
        process.exit(1);
    }

    console.log('Testing connection to:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Successfully connected to MongoDB!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        if (error.name === 'MongoServerSelectionError') {
            console.error('   -> Check IP Whitelist (0.0.0.0/0)');
            console.error('   -> Check Username/Password in URI');
        }
        process.exit(1);
    }
}

testConnection();
