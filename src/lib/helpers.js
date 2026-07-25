// Handlebars helpers registered on the view engine in src/app.js. Kept in
// their own module so each branch can be unit tested directly.
const number3 = (n) => (typeof n === 'number' && !Number.isNaN(n) ? n.toFixed(3) : '-');

module.exports = { number3 };
