require('dotenv').config();

const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');

const { getDefaultSeasonKey } = require('./lib/nav');
const helpers = require('./lib/helpers');

const app = express();
const PORT = process.env.PORT || 8080;

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, '../views/layouts'),
  partialsDir: path.join(__dirname, '../views/partials'),
  helpers,
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.static(path.join(__dirname, '../public')));

// Railway deployment healthcheck target.
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// www → root redirect, matching playoffrally.com.
app.use((req, res, next) => {
  if (req.hostname === 'www.allenvestal.com') {
    return res.redirect(301, `https://allenvestal.com${req.originalUrl}`);
  }
  next();
});

app.use((req, res, next) => {
  res.locals.defaultSeasonKey = getDefaultSeasonKey();
  res.locals.currentYear = new Date().getFullYear();
  res.locals.canonicalUrl = `https://allenvestal.com${req.path}`;
  next();
});

app.use('/', require('./routes/index'));
app.use('/softball', require('./routes/softball'));

app.use((req, res) => {
  res.status(404).render('error', {
    pageTitle: 'Page Not Found',
    message: "The page you're looking for doesn't exist.",
    noIndex: true,
  });
});

/* istanbul ignore if -- exercised by starting the process, not by tests */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
