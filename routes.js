const UserController = require('./controller/UserController');
const JWTService = require('./service/JWTService');

module.exports = function (app, db) {
    // token verifier
    app.use("/user/:name", JWTService.check);

    // common routes
    app.get('/login', UserController.login(app, db));
    app.post('/register', UserController.register(app, db));
    
    // authorized
    app.get('/user/:name', UserController.getUserProfile(app, db));
    //app.put('/user/:name', UserController.updateUserProfile(app, db));
};