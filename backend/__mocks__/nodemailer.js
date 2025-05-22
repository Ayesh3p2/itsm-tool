module.exports = {
    createTransport: () => ({
        sendMail: () => Promise.resolve({}),
        verify: () => Promise.resolve({})
    })
};
