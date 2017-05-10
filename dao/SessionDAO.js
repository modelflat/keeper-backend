const collectionName = require("../server").sessionsCollectionName;

class SessionDAO {
    
    // TODO same as in UserDAO
    
    // UPD: looks like JWT has all the functionality SessionDAO was implemented for!
    // UPD2: ...except for session ending
    
    constructor(db) {
        this.db = db;
    }
    
    // initiate new session
    startSession(username, jwt) {
        return this.db.collection(collectionName).insertOne(
                {jwt: jwt, created: Date.now(), name: username}
        );
    }
    
    // lookup for existing session by jwt
    findSession(jwt) {
        return this.db.collection(collectionName).findOne(
            {jwt: jwt}
        );
    }
    
    // end session by jwt
    endSession(jwt) {
        return this.db.collection(collectionName).deleteOne(
            {jwt: jwt}
        );
    }
    
    endSessionsForUser(username) {
        return this.db.collection(collectionName).deleteMany(
            {name: username}
        );
    }
    
}

module.exports = SessionDAO;