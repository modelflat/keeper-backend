const jwt = require("jsonwebtoken");
const credentials = require("../credentials");

class JWTService {

    static sign(user) {
        return jwt.sign({name : user.name}, credentials.jwtSecret, { expiresIn: '7d' });
    }
    
    static verify(token) {
        return jwt.verify(token, credentials.jwtSecret);
    }

    static check(req, res, next) {
        // NOTE: we try both body and query params, just for convenience
        let token = req.body.token || req.query.token;
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
            console.log(err);
        }
        
        if (invalid) {
            console.log("token is invalid");
            res.status(401).send({error : "jwt is invalid"});
        } else {
            console.log('token is valid');
            next();
        }
    }
}

module.exports = JWTService;