const collectionName = require("../server").sessionCollectionName;

class SessionDAO {
    
    // TODO same as in UserDAO
    
    // UPD: looks like JWT has all the functionality SessionDAO was implemented for!
    
    // initiate new session
    static addSession(username, jwt, db) {
        return db.collection(collectionName).insertOne(
            {jwt: jwt, created: new Date(), name: username}
        );
    }
    
    // lookup for existing session by jwt
    static getSession(jwt, db) {
        return db.collection(collectionName).findOne(
            {jwt: jwt}
        );
    }
    
}

module.exports = SessionDAO;