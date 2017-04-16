const app = require('../server');

exports.postUser = function (req, res) {
    let newUser = req.body;
    console.log(newUser);
    console.log(app.get('port'));

    res.sendStatus(200);
};