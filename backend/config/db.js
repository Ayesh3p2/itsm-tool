const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');

// Initialize mongoose connection
let dbConnection;

// Generate encryption keys
const encryptionKey = crypto.randomBytes(32).toString('hex');
const iv = crypto.randomBytes(16).toString('hex');

// Encryption middleware
const encryptData = (data) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), Buffer.from(iv));
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

// Decryption middleware
const decryptData = (encryptedData) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), Buffer.from(iv));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
};

const connectDB = async () => {
    try {
        if (dbConnection) {
            return dbConnection;
        }

        // Read SSL certificates from file system
        const ca = fs.readFileSync(process.env.MONGODB_SSL_CA);
        const cert = fs.readFileSync(process.env.MONGODB_SSL_CERT);
        const key = fs.readFileSync(process.env.MONGODB_SSL_KEY);
        const pass = process.env.MONGODB_SSL_PASS;

        // Use test database if NODE_ENV is test
        const uri = process.env.NODE_ENV === 'test' 
            ? 'mongodb://localhost:27017/itsm-test' 
            : process.env.MONGODB_URI;

        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            ssl: true,
            sslValidate: true,
            sslCA: ca,
            sslCert: cert,
            sslKey: key,
            sslPass: pass,
            auth: {
                user: process.env.MONGODB_USER,
                password: process.env.MONGODB_PASS
            },
            tls: true,
            tlsCAFile: process.env.MONGODB_SSL_CA,
            tlsCertificateKeyFile: process.env.MONGODB_SSL_KEY,
            tlsCertificateFile: process.env.MONGODB_SSL_CERT
        });

        // Add encryption middleware to mongoose
        mongoose.set('debug', true);
        mongoose.set('runValidators', true);
        mongoose.set('strictQuery', true);

        dbConnection = mongoose.connection;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log('SSL/TLS connection established');
        return { encryptData, decryptData, dbConnection };
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        throw error;
    }
};

// Export a function to close the connection
const closeDB = async () => {
    try {
        if (dbConnection) {
            await mongoose.connection.close();
            console.log('MongoDB Connection Closed');
            dbConnection = null;
        }
    } catch (error) {
        console.error(`Error closing MongoDB connection: ${error.message}`);
        throw error;
    }
};

module.exports = { connectDB, closeDB };

// Close connection on process exit
process.on('SIGINT', async () => {
    await closeDB();
    process.exit(0);
});
