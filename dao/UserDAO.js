const User = require('../model/User');
const collectionName =require("../server").usersCollectionName;

class UserDAO {
    
    // TODO: back in Java/C++/etc, we could store some useful information in DAOs.
    // probably class shouldn't be full-static?
    
    // adds new user 
    static addNewUser(user, db) {
        // returning new promise just to encapsulate DAL logic
        return new Promise((resolve, reject) => {
            db.collection(collectionName).insertOne(user)
                .then(doc => resolve(user))
                .catch(err => reject("User with such name/email already exists!"));
        });
    }

    // retrieves user either by email or by name
    static findUser(name, email, db) {
        var query;
        
        if (name) {
            query = {username : name} 
        } else if (email) {
            query = {email : email}
        } else {
            return Promise.reject('invalid login type');
        }
        
        return new Promise((resolve, reject) => {
            db.collection(collectionName).findOne(query)
                .then(document => {
                    // OK, creating user object
                    if (document) {
                        resolve(new User(document));
                    } else {
                        reject("no user with such name or email");
                    }
                })
                // something went wrong
                .catch(console.error);
        });
    }

    static updateUser(oldUsername, updatedUser, db) {
        return new Promise((resolve, reject) => {
            db.collection(collectionName).findOneAndUpdate(
                { username: oldUsername }, {
                    $set: { 
                        username: updatedUser.username, 
                        password: updatedUser.password, 
                        email: updatedUser.email
                    }
                }, {projection: {_id: 0, password: 0}, returnNewDocument: 1}
            ).then(document => {
                if (document.value) {
                    // everything's alright
                    console.log(document);
                    resolve(new User(document.value));
                } else {
                    reject("cannot update user " + oldUsername);
                }
            })
            // if we fail to update, then there are two possible problems:
            // 1) connection error, server down, etc.
            // 2) failing to satisfy unique constraints either on username or on email
            .catch(reject);
        });
    }
}

module.exports = UserDAO;