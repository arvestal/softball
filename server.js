// set up ========================
const express = require('express');
const morgan = require('morgan');
const app = express();
const routes = require('./public/lib/routes');

// configuration

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));

// routes
app.use('/api', routes);
// application
// app.get('*', function(req, res) {
//     res.sendFile(__dirname + '/public/index.html');
// });

// listen (start app with node server.js) ======================================
app.listen(8080);
console.log('App listening on port 8080');
