const User = require('../model/User');
const collectionName =require("../server").usersCollectionName;

class UserDAO {
    
    // TODO: back in Java/C++/etc, we could store some useful information in DAOs.
    // probably class shouldn't be full-static? UPD: yeah
    
    constructor(db) {
        this.db = db;
    }
    
    // adds new user 
    addNewUser(user) {
        // returning new promise just to encapsulate DAL logic
        return new Promise((resolve, reject) => {
            this.db.collection(collectionName).insertOne(user)
                .then(doc => resolve(user))
                .catch(err => reject("User with such name/email already exists!"));
        });
    }

    // retrieves user either by email or by name
    findUser(name, email) {
        var query;
        
        if (name) {
            query = {username : name} 
        } else if (email) {
            query = {email : email}
        } else {
            return Promise.reject('invalid login type');
        }
        
        return new Promise((resolve, reject) => {
            this.db.collection(collectionName).findOne(query)
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

    updateUser(oldUsername, updatedUser) {
        return new Promise((resolve, reject) => {
            this.db.collection(collectionName).findOneAndUpdate(
                { username: oldUsername }, { $set: updatedUser }, {projection: {_id: 0}, returnNewDocument: 1}
            ).then(document => {
                if (document.value) {
                    // everything's alright
                    resolve(new User(document.value));
                } else {
                    reject("cannot update user " + oldUsername + "; user not found!");
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