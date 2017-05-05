const jwtService = require('../services/jwtService');
const ObjectId = require('mongodb').ObjectID;

class User {
    constructor(props) {
        this._id = ObjectId(props._id) || '';
        this.username = props.username;
        this.password = props.password;
        this.email = props.email || '';
        this.ui = {};
        this.cards = [];
    }

    static updateProfile(id, user, db) {
        return new Promise((resolve, reject) => {
            db.collection('users').findOneAndUpdate({ _id: ObjectId(id) }, {
                $set: { username: user.username, password: user.password, email: user.email }
                })
                .then(doc => {
                    console.log('updateProfile:\n', doc);
                    resolve(user);
                })
                .catch(reject);
        });
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

    static login(type, user, db) {
        switch (type) {
            case 'username':
                return new Promise((resolve, reject) => {
                    db.collection('users').findOne({ username: user.username })
                        .then(resolve)
                        .catch(console.error);
                });

            case 'email':
                return new Promise((resolve, reject) => {
                    db.collection('users').findOne({ email: user.email })
                        .then(user => {
                            resolve(user);
                        })
                        .catch(console.error);
                });

            default:
                return Promise.reject('invalid login`s type');
        }
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
