const jwt = require('jsonwebtoken');
const credentials = require('../credentials');
const ObjectId = require('mongodb').ObjectID;


class jwtService {
    static use(user, db) {
        let token = jwt.sign({ id: user._id }, credentials.jwtSecret, { expiresIn: '7d' });
        user.token = token;

        return new Promise((resolve, reject) => {
            db.collection('users').findOneAndReplace({ username: user.username }, user)
                .then(result => {
                    resolve(user);
                });
        });
    }

    static check(req, res, next) {
        let loginRegexp = /\/user\?username=[.]&password=[.]$/;
        if (req.method.toLowerCase() == 'post' && req.url == '/user') return next();
        if (req.method.toLowerCase() == 'get' && loginRegexp.exec(req.url) != -1) return next();

        let token = req.headers.token;
        try {
            jwt.verify(token, credentials.jwtSecret);
            console.log('token is verifyed');
            next();
        } catch (err) {
            console.log('token is invalid:\n', err);
            res.status(401).send(err);
        }
    }

    static getUserId(token) {
        let decoded = jwt.decode(token);
        if (decoded) {
            return ObjectId(jwt.decode(token).id);
        } else {
            return null;
        }
    }
}

module.exports = jwtService;