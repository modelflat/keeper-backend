const collectionName = require("../server").sessionCollectionName;

class SessionDAO {
    
    // TODO same as in UserDAO
    
    // UPD: looks like JWT has all the functionality SessionDAO was implemented for!
    // UPD2: ...except for session ending
    
    // initiate new session
    static startSession(username, jwt, db) {
        return db.collection(collectionName).insertOne(
                {jwt: jwt, created: Date.now(), name: username}
        );
    }
    
    // lookup for existing session by jwt
    static findSession(jwt, db) {
        return db.collection(collectionName).findOne(
            {jwt: jwt}
        );
    }
    
    // end session by jwt
    static endSession(jwt, db) {
        return db.collection(collectionName).deleteOne(
            {jwt: jwt}
        );
    }
    
}

module.exports = SessionDAO;