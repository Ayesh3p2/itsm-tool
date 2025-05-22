const mongoose = {
    Schema: {
        Types: {
            ObjectId: () => 'ObjectId'
        }
    },
    model: jest.fn(),
    connect: jest.fn().mockResolvedValue({
        connection: {
            host: 'localhost'
        }
    })
};

module.exports = mongoose;
