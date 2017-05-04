const User = require('../models/User');

exports.postUser = function (app, db) {
    return (req, res) => {
        let user = new User(req.body);

        console.log('Will postUser:\n', user);

        User.insertOne(user, db)
            .then(user => res.status(200).send(user))
            .catch(err => {
                res.status(400).send(err);
                console.log('postUser error:\n', err);
            });
    };
};

exports.login = function (app, db) {
    return (req, res) => {
        let user = new User(req.query);

        console.log('Will login:\n', user);

        User.findOne(user, db)
            .then(user => {
                if (!user) {
                    res.status(404).send();
                } else {
                    res.status(200).send(user);
                }
            })
            .catch(err => {
                res.status(500).send(err);
                console.log('login error:\n', err);
            });
    };
};

exports.getUserByToken = function (app, db) {
    return (req, res) => {
        let token = req.headers.token;

        console.log('Will getUserByToken:\n', token);

        User.getByToken(token, db)
            .then(user => res.status(200).send(user))
            .catch(err => {
                res.status(404).send(err);
                console.log('getUserByToken error:\n', err);
            });
    };
};