const User = require('../model/User');
const JWTService = require("../service/JWTService");

const checkPassword = require("../Util").checkPassword;
const hashAndSaltPassword = require("../Util").hashAndSaltPassword;

exports.register = function (app) {
    return (req, res) => {
        let user = new User(req.body);
        user.password = hashAndSaltPassword(user.password);
        
        console.log("trying to add user: ", user);
        
        app.locals.userDAO.addNewUser(user)
            .then(added => {
                // postprocess user
                let u = new User(added);
                // TODO there should be a way not to send certain fields by default. (see User.toResponse)
                let tok = JWTService.sign(u);
                console.log("sign with jwt: " + tok);
                let name = u.username;
                app.locals.sessionDAO.startSession(name, tok)
                .then(() => {
                    console.log("user successfully added!");
                    res.status(201).send({user: u.toResponse(), jwt: tok});
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

exports.login = function (app) {
    return (req, res) => {
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;
        
        console.log("searching for user with " + (email ? "email: " + email : "name: " + username));

        new Promise((resolve, reject) => {
            app.locals.userDAO.findUser(username, email)
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
            console.log("sign with jwt: " + tok);
            app.locals.sessionDAO.startSession(user.username, tok)
            .then(() => {
                console.log("user successfully logged in!");
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

exports.getUserProfile = function (app) {
    return (req, res) => {
        app.locals.userDAO.findUser(req.params.name, null)
            .then(user => {
                res.status(200).send(user.toResponse());
            })
            .catch(err => {
                res.status(404).send({error: err})
            });
    };
};

exports.updateUserProfile = function (app) {
    return (req, res) => {
        let oldUsername = req.params.name;
        console.log("updating user " + oldUsername + " with:\n", req.infoToUpdate);
        // TODO reassign JWT on name change
        app.locals.userDAO.updateUser(oldUsername, req.infoToUpdate)
            .then(user => {
                console.log("user info updated successfully!", user);
                if (oldUsername === req.infoToUpdate.username) {
                    console.log("username hasnt changed, responding with updated profile.");
                    res.status(200).send(user);
                } else {
                    console.log("username changed -> ending all sessions for old username...");
                    app.locals.sessionDAO.endSessionsForUser(oldUsername)
                    .then((result) => {
                        console.log(result.deletedCount + " sessions for name " + oldUsername + " were successfully removed from db");
                        let jwt = JWTService.sign(req.infoToUpdate.username); 
                        console.log("new username signed with jwt: " + jwt);
                        console.log("starting new session for " + req.infoToUpdate.username + "...")
                        app.locals.sessionDAO.startSession(jwt, req.infoToUpdate.username)
                        .then(() => {
                            console.log("session successfully started, redirecting user to their new homepage...");
                            res.status(301).set("jwt", jwt).redirect("/user/" + req.infoToUpdate.username);
                            console.log(res);
                        })
                        .catch(console.error);
                    })
                    .catch(console.error);
                }
            })
            .catch(err => {
                res.status(500).send({error: "cannot update user profile for user \"" + oldUsername + "\""});
                console.error('updateUserProfile error:\n', err);
            });
    };
}

