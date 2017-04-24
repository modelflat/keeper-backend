module.exports = {
    mongo: 'mongodb://localhost:27017/keeper',
    jwtSecret: 'secret',
    tokenExpires: Math.floor(Date.now() / 1000) + 40 * 1 * 1 * 1 // четверть минуты
};