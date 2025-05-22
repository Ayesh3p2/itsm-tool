const dotenv = require('dotenv');
const { connectDB, closeDB } = require('./config/db');

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock JWT for testing
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'test-token'),
    verify: jest.fn(() => ({ id: 'test-id', role: 'manager' }))
}));

// Global beforeAll hook to set up test environment
beforeAll(async () => {
    try {
        await connectDB();
        console.log('Test database connected');
    } catch (error) {
        console.error('Failed to connect to test database:', error);
        throw error;
    }
});

// Global afterAll hook to clean up
afterAll(async () => {
    try {
        await closeDB();
        console.log('Test database connection closed');
    } catch (error) {
        console.error('Failed to close test database connection:', error);
        throw error;
    }
});

// Global beforeEach hook to clean up between tests
beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
});

// Global afterEach hook to clean up
afterEach(() => {
    // Clear any timers
    jest.clearAllTimers();
});
