const jwt = require("jsonwebtoken");
const credentials = require("../credentials");

const validateUsername = require("../Util").validateUsername;

class JWTService {

    static sign(user) {
        return jwt.sign({name : user.username}, credentials.jwtSecret, { expiresIn: '7d' });
    }
    
    static verify(token) {
        return jwt.verify(token, credentials.jwtSecret);
    }

    // TODO use app.param for token validation
    static validateJWT(req, res, next) {
        if (!validateUsername(req.params.name)) {
            res.status(400).send({error: "invalid username"});
            return;
        }
        
        // NOTE: we try body, query and headers params, just for convenience
        let token = req.body.token || req.query.token || req.headers.jwt;
        if (!token) {
            res.status(401).send({error : "jwt not provided"});
            return;
        }
        
        var invalid = true;
        try {
            let username = jwt.verify(token, credentials.jwtSecret).name;
            if (username === req.params.name) {
                invalid = false;
            }
        } catch (err) {
            invalid = err;
        }
        
        if (invalid) {
            res.status(401).send({error : invalid.message || "jwt is invalid"});
        } else {
            next();
        }
    }
}

module.exports = JWTService;