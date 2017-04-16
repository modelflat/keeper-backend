module.exports = {
    mongo: 'mongodb://localhost:27017/keeper',
    jwtSecret: 'secret',
    tokenExpires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // месяц
};