const { createAdminToken, verifyAdminToken } = require('../../src/lib/admin-auth');

describe('createAdminToken / verifyAdminToken', () => {
  it('verifies a token it created itself for the matching email', () => {
    const token = createAdminToken('arvestal@gmail.com', 'test-secret');
    expect(verifyAdminToken(token, 'test-secret', 'arvestal@gmail.com')).toMatchObject({ email: 'arvestal@gmail.com' });
  });

  it('rejects a token whose email does not match the expected admin email', () => {
    const token = createAdminToken('someone-else@gmail.com', 'test-secret');
    expect(verifyAdminToken(token, 'test-secret', 'arvestal@gmail.com')).toBeNull();
  });

  it('rejects a token signed with a different secret', () => {
    const token = createAdminToken('arvestal@gmail.com', 'test-secret');
    expect(verifyAdminToken(token, 'wrong-secret', 'arvestal@gmail.com')).toBeNull();
  });

  it('rejects a malformed token', () => {
    expect(verifyAdminToken('not-a-real-token', 'test-secret', 'arvestal@gmail.com')).toBeNull();
  });

  it('returns null when there is no token at all', () => {
    expect(verifyAdminToken(undefined, 'test-secret', 'arvestal@gmail.com')).toBeNull();
    expect(verifyAdminToken('', 'test-secret', 'arvestal@gmail.com')).toBeNull();
  });

  it('rejects an expired token', () => {
    const jwt = require('jsonwebtoken');
    const expired = jwt.sign({ email: 'arvestal@gmail.com' }, 'test-secret', { expiresIn: -10 });
    expect(verifyAdminToken(expired, 'test-secret', 'arvestal@gmail.com')).toBeNull();
  });
});
