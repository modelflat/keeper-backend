const UserController = require('./controller/UserController');
const JWTService = require('./service/JWTService');

const loginValidator = require("./Util").loginValidator;
const registrationValidator = require("./Util").registrationValidator;

module.exports = function (app, db) {
    // common routes
    app.post("/login", loginValidator, UserController.login(app, db));
    app.post("/register", registrationValidator, UserController.register(app, db));
    
    // token/name verifier
    app.use("/user/:name", JWTService.check);
    // authorized
    app.get('/user/:name', UserController.getUserProfile(app, db));
    app.post('/user/:name', UserController.updateUserProfile(app, db));
};