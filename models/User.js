const jwtService = require('../services/jwtService');

class User {
    constructor(props) {
        this.username = props.username;
        this.password = props.password;
        this.ui = {};
        this.cards = [];
    }

    static insertOne(user, db) {
        return new Promise((resolve, reject) => {
            db.collection('users').findOne({ username: user.username })
                .then(doc => {
                    if (doc) reject(new Error('A user already exists'));

                    return new Promise((resolve, reject) => {
                        db.collection('users').insertOne(user)
                            .then(result => {
                                resolve(user);
                            });
                    });
                })
                .then(user => {
                    jwtService.use(user, db)
                    resolve(user);
                })
                .catch(console.error);
        });
    }

    static findOne(user, db) {
        return new Promise((resolve, reject) => {
            db.collection('users').findOne({ username: user.username })
                .then(resolve)
                .catch(console.error);
        });
    }

    static getByToken(token, db) {
        let id = jwtService.getUserId(token);

        if (id) {
            return new Promise((resolve, reject) => {
                db.collection('users').findOne({ _id: id })
                    .then(resolve)
                    .catch(console.error);
            })
        } else {
            return Promise.reject('User not found');
        }
    }
}

module.exports = User;
