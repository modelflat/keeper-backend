class dbService {
    static postUser(err, user, db) {
        if (err) throw new Error('A user already exists');

        return new Promise((resolve, reject) => {
            db.collection('users').insertOne(user)
                .then(result => {
                    resolve(user);
                });
        });
    }
}

module.exports = dbService;