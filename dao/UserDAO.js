const User = require('../model/User');
const collectionName =require("../server").usersCollectionName;

class UserDAO {
    
    // TODO: back in Java/C++/etc, we could store some useful information in DAOs.
    // probably class shouldn't be full-static?
    
    static updateUser(oldUsername, updatedUser, db) {
        return new Promise((resolve, reject) => {
            db.collection(collectionName).findOneAndUpdate(
                { name: oldUsername }, {
                    // TODO check this query
                    $set: { name: updatedUser.name, passHash: updatedUser.passHash, email: updatedUser.email }
                }
            ).then(document => {
                console.log('profile updated:\n', document);
                // everything's alright
                resolve(new User(document));
            })
            // if we fail to update, then there are two possible problems:
            // 1) connection error, server down, etc.
            // 2) failing to satisfy unique constraints either on username or on email
            .catch(reject);
        });
    }

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
    static getUser(type, emailOrName, db) {
        var query;
        
        switch (type) {
            case "name":
                query = {name : emailOrName} 
                break;
            case "email":
                query = {email : emailOrName}
                break;
            default:
                return Promise.reject('invalid login type');
        }
        
        return new Promise((resolve, reject) => {
            db.collection(collectionName).findOne(query)
                .then(document => {
                    // OK, creating user object
                    if (document) {
                        resolve(new User(document));
                    } else {
                        reject("no user with " + type + "=" + emailOrName);
                    }
                })
                .catch(console.error);
        });
    }
}

module.exports = UserDAO;