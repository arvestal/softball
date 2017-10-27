// set up ========================
const express = require('express');
const morgan = require('morgan');
const app = express();
const routes = require('./public/lib/routes');
const log = require('./public/lib/logger');

// configuration

app.use(express.static(__dirname + '/public'));
//app.use(morgan('dev'));
app.use(morgan({
  // skip: (req, res) => {
  //   return res.statusCode < 400;
  // },
  stream: log.stream
}));

// routes
app.use('/api', routes);


// listen (start app with node server.js) ======================================
app.listen(8080);
log.info('App listening on port 8080');
