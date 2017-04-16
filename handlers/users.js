const credentials = require('../credentials');
const jwt = require('jsonwebtoken');

exports.getUser = function (app, db) {
    return function (req, res) {
        const user = req.query;

        db.collection('users').findOne(user)
            .then(user => {
                if (!user) return res.status(404).send('User not found');
                res.status(200).send(user)
            })
            .catch(console.error);
    };
};

exports.postUser = function (app, db) {
    return function (req, res) {
        const { username, password } = req.body;

        db.collection('users').findOne({ username, password })
            .then(insertUser)
            .then(applyJWT)
            .then(sendResponse)
            .catch(handleError);


        function insertUser(doc) {
            if (doc) return Promise.reject(400);

            return db.collection('users').insertOne({ username, password })
                .then(({ insertedId }) => ({
                    _id: insertedId,
                    username,
                    password
                }));
        }

        function applyJWT(user) {
            let token = jwt.sign({
                id: user._id,
                exp: credentials.tokenExpires
            }, credentials.jwtSecret);

            user.token = token

            return new Promise((resolve, reject) => {
                db.collection('users').updateOne({ username }, { $set: { token } })
                    .then(() => resolve(user));
            });
        }

        function sendResponse(user) {
            res.status(201).send(user);
        }

        function handleError(err) {
            switch (err) {
                case 400:
                    res.status(400).send('User is exist');
                    break;
                default:
                    res.status(500).send();
                    throw err;
            }
        }
    };
};


exports.checkToken = function (app, db) {
    return function (req, res, next) {
        let { token } = req.query;
        let tokenIsAlived = false;

        if (!token) return next();

        jwt.verify(req.query.token, credentials.jwtSecret, (err, decoded) => {
            if (err) return res.status(401).send(err.message);
            next();
        });
    };
}