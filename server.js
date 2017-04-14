const express = require('express');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const app = express();

app.set('port', 3000);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./routes')(app);


app.all('*', (req, res) => {
    res.sendStatus(500);
});

app.listen(app.get('port'), () => {
    console.info('server started');
});