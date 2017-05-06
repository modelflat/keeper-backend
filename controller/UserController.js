const User = require('../model/User');
const UserDAO = require("../dao/UserDAO");
const JWTService = require("../service/JWTService");

exports.updateUserProfile = function (app, db) {
    return (req, res) => {
        let user = User.fromBody(req.body);
        console.log('Will updateUserProfile:\n', user.name);
        
        //TODO implement
        
        //~ UserDAO.updateUser(req.body.oldUsername, user, db)
            //~ .then(user => {
                //~ res.status(200).send(user);
            //~ })
            //~ .catch(err => {
                //~ res.status(500).send(err);
                //~ console.log('updateUserProfile error:\n', err);
            //~ });
    };
}

exports.register = function (app, db) {
    return (req, res) => {
        let name = req.body.name;
        let passHash = req.body.passHash;
        let email = req.body.email;
        
        if (!name || !passHash || !email) {
            res.status(400).send(req.body);
            return;
        }
        
        let user = User.fromBody(name, passHash, email);
        console.log("trying to add user: ", user);
        UserDAO.addNewUser(user, db)
            .then(added => {
                // remove redundant fields
                let u = new User(added);
                u.token = JWTService.sign(u);
                res.status(200).send(u);
            })
            .catch(err => {
                // TODO response code?
                res.status(400).send({error : err});
                console.log(err);
            });
    };
};

exports.login = function (app, db) {
    return (req, res) => {
        // prefer name over email
        let info = req.query.name || req.query.email;
        let type = req.query.type;
        let passHash = req.query.passHash;
        
        if (!info || !type || !passHash) {
            res.status(400).send({error : "Wrong request parameters"});
            return;
        }
        
        console.log("searching for user by " + type + "=" + info);

        new Promise((resolve, reject) => {
            UserDAO.getUser(type, info, db)
                .then(user => {
                    console.log("user found: ", user);
                    if (user.passHash === passHash) {
                        console.log("passHash seems ok; returning user.");
                        resolve(user);
                    } else {
                        // TODO: security breach: should not tell whether the user exists
                        console.log("wrong password : hash check failed.");
                        reject({error: "Wrong password"});
                    }
                })
                .catch(err => {
                    console.log(err);
                    reject({ error: err });
                });
        })
        // now we got user who is properly logged in. let's open session for him:
        .then(user => {
            user.token = JWTService.sign(user);
            res.status(200).send(user);
        })
        .catch(err => {
            console.log("error: ", err);
            res.status(404).send(err);
        });
    };
};

exports.getUserProfile = function (app, db) {
    return (req, res) => {
        
        let name = req.params.name;
        
        if (!name || name === "") {
            res.status(400).send({error: "invalid user name"});
            return;
        }
        
        UserDAO.getUser("name", name, db)
            .then(user => {
                res.status(200).send(user);
            })
            .catch(err => {
                res.status(404).send({error: err})
            });
    };
    
};