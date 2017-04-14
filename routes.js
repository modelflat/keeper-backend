const users = require('./handlers/users');

module.exports = function (app) {

    // users routes
    app.post('/user', users.postUser);
};