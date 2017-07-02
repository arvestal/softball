// set up ========================
let express = require('express'),
    morgan = require('morgan');
let app = express();


// configuration

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));

// routes

// application
app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// listen (start app with node server.js) ======================================
app.listen(8080);
console.log('App listening on port 8080');
