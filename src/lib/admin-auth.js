const jwt = require('jsonwebtoken');

const TOKEN_COOKIE = 'admin_token';
const STATE_COOKIE = 'oauth_state';
const TOKEN_TTL = '30d';
const STATE_TTL_MS = 5 * 60 * 1000;

function createAdminToken(email, secret) {
  return jwt.sign({ email }, secret, { expiresIn: TOKEN_TTL });
}

// Returns the decoded payload if the token is a validly-signed, unexpired JWT for exactly
// expectedEmail, otherwise null. Any other admin email would mean ADMIN_EMAIL changed after the
// cookie was issued, or the token belongs to a different deployment's secret — both should fail.
function verifyAdminToken(token, secret, expectedEmail) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret);
    return payload.email === expectedEmail ? payload : null;
  } catch {
    return null;
  }
}

module.exports = { createAdminToken, verifyAdminToken, TOKEN_COOKIE, STATE_COOKIE, STATE_TTL_MS };
