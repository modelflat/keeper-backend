//
// TODO: figure out where does this functionality belong structurally
//
const md5 = require("blueimp-md5");

// middleware validator for /login
module.exports.loginValidator = (req, res, next) => {
    if ((validateUsername(req.body.username) || req.body.email) && req.body.password) {
        next();
        return;
    }
    res.status(400).send({error : "Wrong login request parameters"});
}

// middleware validator for /register
module.exports.registrationValidator =(req, res, next) => {
    if (validateUsername(req.body.username) && validateEmail(req.body.email) && validatePassword(req.body.password)) {
        next();
        return;
    }
    res.status(400).send({error: "Wrong register request parameters"});
}

// sample username validation
function validateUsername(name) {
    return name && name.length >= 3;
}
module.exports.validateUsername = validateUsername;

// sample email validation
function validateEmail(email) {
    return !!email;
}
module.exports.validateEmail = validateEmail;

// sample password validation
 function validatePassword(password) {
    return password && password.length >= 3 && password.length < 128
}
module.exports.validatePassword = validatePassword;

function createSalt() {
    // todo: replace Math.random
    return Math.floor(Math.random() * (1 << 31));
}

function hashAndSaltPassword(password, salt) {
    return md5(password + salt) + "$" + salt;
}
module.exports.hashAndSaltPassword = (password) => {
    return hashAndSaltPassword(password, createSalt());
}

 function checkPassword(candidate, password) {
    return candidate === hashAndSaltPassword(password, candidate.split("$")[1])
}
module.exports.checkPassword = checkPassword;

