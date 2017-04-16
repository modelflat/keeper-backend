const MongoClient = require('mongodb').MongoClient;
const credentials = require('./credentials');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const express = require('express');
const app = express();

app.set('port', 3000);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


MongoClient.connect(credentials.mongo, (err, database) => {
    if (err) console.error(err);
    require('./routes')(app, database);
    app.listen(app.get('port'), () => console.log('server started'));
});
