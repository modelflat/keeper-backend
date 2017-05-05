const users = require('./controllers/users');
const jwtService = require('./services/jwtService');

module.exports = function (app, db) {

    // token
    app.use(jwtService.check);

    // user routes
    app.post('/user', users.postUser(app, db));
    app.get('/user', users.login(app, db));
    app.get('/user-by-token', users.getUserByToken(app, db));
    app.put('/user-profile', users.updateUserProfile(app, db));
};