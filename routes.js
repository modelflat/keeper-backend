const users = require('./handlers/users');

module.exports = function (app, db) {

    // check token route
    app.use(users.checkToken(app, db));

    // users routes
    app.get('/login', users.login(app, db));
    app.get('/user', users.getUser(app, db));
    app.post('/user', users.postUser(app, db));
};