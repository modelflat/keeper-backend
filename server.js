const MongoClient = require('mongodb').MongoClient;
const credentials = require('./credentials');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const express = require('express');
const app = express();

const usersCollectionName = "users";
module.exports.usersCollectionName = usersCollectionName;
const sessionsCollectionName = "sessions";
module.exports.sessionsCollectionName = sessionsCollectionName;

const UserDAO = require("./dao/UserDAO");
const SessionDAO = require("./dao/SessionDAO");

app.set('port', 3000);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

MongoClient.connect(credentials.mongo, (err, database) => {
    if (err) {
        console.error(err);
        return;
    }
    
    // TODO move into separarte file 
    // create indices
    // TODO data races?
    Promise.all([
            database.collection(usersCollectionName).createIndexes(
                [{key : {name: 1}, unique: 1}, {key : {email: 1}, unique: 1}]
            ),
            database.collection(sessionsCollectionName).createIndexes(
                [{key: {created: 1}, expireAfterSeconds: 3600*24*7}, {key: {jwt: 1}}]
            )
        ])
        // if indices already exist, then nothing happens
        //.then(console.log)
        .catch((err) => {
            console.error(err);
            return;
        });
        
    app.locals.userDAO = new UserDAO(database);
    app.locals.sessionDAO = new SessionDAO(database);
    
    require('./routes')(app);
    
    app.listen(app.get('port'), () => console.log('server started'));
});
