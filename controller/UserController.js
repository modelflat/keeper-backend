const User = require('../model/User');
const UserDAO = require("../dao/UserDAO");
const JWTService = require("../service/JWTService");

const checkPassword = require("../Util").checkPassword;
const hashAndSaltPassword = require("../Util").hashAndSaltPassword;

exports.register = function (app, db) {
    return (req, res) => {
        let user = new User(req.body);
        user.password = hashAndSaltPassword(user.password);
        
        console.log("trying to add user: ", user);
        
        UserDAO.addNewUser(user, db)
            .then(added => {
                // postprocess user
                let u = new User(added);
                // TODO there should be a way not to send certain fields by default. (see User.toResponse)
                let tok = JWTService.sign(u);
                let name = u.username;
                SessionDAO.startSession(name, tok, db)
                .then(() => {
                    res.status(200).send({user: u.toResponse(), jwt: tok});
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).send({error: err.message});
                });
            })
            .catch(err => {
                res.status(400).send({error : err});
                console.log(err);
            });
    };
};

exports.login = function (app, db) {
    return (req, res) => {
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;
        
        console.log("searching for user with " + (email ? "email: " + email : "name: " + username));

        new Promise((resolve, reject) => {
            UserDAO.findUser(username, email, db)
                .then(user => {
                    console.log("user found: ", user);
                    if (checkPassword(user.password, password)) {
                        console.log("password seems to be ok; returning user.");
                        resolve(user);
                    } else {
                        // TODO: security breach: should not tell whether the user exists
                        console.log("wrong password : check failed.");
                        reject({error: "Wrong password"});
                    }
                })
                .catch(err => {
                    console.log(err);
                    reject({ error: err });
                });
        })
        // now we got user who is properly logged in. let's open session for him
        .then(user => {
            let tok = JWTService.sign(user);
            SessionDAO.startSession(user.username, tok, db)
            .then(() => {
                res.status(200).send({user: user.toResponse(), jwt: tok});
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send({error: err.message});
            })
        })
        .catch(err => {
            console.log("error: ", err);
            res.status(404).send({error: err});
        });
    };
};

exports.getUserProfile = function (app, db) {
    return (req, res) => {
        UserDAO.findUser(req.params.name, null, db)
            .then(user => {
                res.status(200).send(user.toResponse());
            })
            .catch(err => {
                res.status(404).send({error: err})
            });
    };
};

exports.updateUserProfile = function (app, db) {
    return (req, res) => {
        let user = new User(req.body);
        let oldUsername = req.params.name;
        
        console.log("updating user " + oldUsername + " with:\n", user);
        // TODO reassign JWT on name change
        UserDAO.updateUser(oldUsername, user, db)
            .then(user => {
                res.status(200).send(user);
            })
            .catch(err => {
                res.status(500).send({error: "cannot update user profile for user \"" + user.username + "\""});
                console.log('updateUserProfile error:\n', err);
            });
    };
}

