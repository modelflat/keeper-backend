const UserController = require('./controller/UserController');
const JWTService = require('./service/JWTService');

// TODO is this require() calls efficient?
const loginValidator = require("./Util").loginValidator;
const registrationValidator = require("./Util").registrationValidator;
const userUpdateValidator = require("./Util").userUpdateValidator;

module.exports = function (app) {
    // common routes
    app.post("/login", loginValidator, UserController.login(app));
    app.post("/register", registrationValidator, UserController.register(app));
    
    // token/name verifier
    app.use("/user/:name", JWTService.validateJWT, userUpdateValidator);
    // authorized
    app.get('/user/:name', UserController.getUserProfile(app));
    app.post('/user/:name', UserController.updateUserProfile(app));
};