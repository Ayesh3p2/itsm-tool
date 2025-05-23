import mongoose from 'mongoose';
import crypto from 'crypto';
import fs from 'fs';

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

        // Read encrypted connection string
        const encryptedUri = fs.readFileSync('.env', 'utf8');
        const uri = decryptData(encryptedUri);

        if (!uri) {
            throw new Error('Failed to decrypt MongoDB connection string');
        }

        // Connect with retry logic
        const maxRetries = 3;
        let retries = 0;

        while (retries < maxRetries) {
            try {
                const conn = await mongoose.connect(uri, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    serverSelectionTimeoutMS: 5000,
                    auth: {
                        user: process.env.MONGODB_ATLAS_USER,
                        password: process.env.MONGODB_ATLAS_PASS
                    }
                });

                // Apply encryption middleware
                mongoose.Schema.Types.String.set('encrypt', function() {
                    return encryptData(this);
                });

                mongoose.Schema.Types.String.set('decrypt', function() {
                    return decryptData(this);
                });

                console.log('MongoDB connected successfully');
                dbConnection = conn;
                return conn;
            } catch (err) {
                console.error(`Connection attempt ${retries + 1} failed:`, err.message);
                if (retries === maxRetries - 1) {
                    throw err;
                }
                retries++;
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
        }
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

// Close connection
const closeDB = async () => {
    if (dbConnection) {
        try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
        } catch (err) {
            console.error('Error closing MongoDB connection:', err);
        }
    }
};

export { connectDB, closeDB };

// Close connection on process exit
process.on('SIGINT', async () => {
    await closeDB();
    process.exit(0);
});
