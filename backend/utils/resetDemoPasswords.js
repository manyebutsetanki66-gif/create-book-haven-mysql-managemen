/*
 * Optional helper: npm run reset:passwords
 * Resets the demo accounts' passwords to the ones in the README (fresh bcrypt hashes).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const demo = [
  ['ADM001', 'Admin@123'],
  ['LIB001', 'Librarian@123'],
  ['MEM001', 'Member@123'],
  ['MEM002', 'Member@123'],
  ['MEM003', 'Member@123'],
];

(async () => {
  try {
    for (const [membershipId, password] of demo) {
      const hash = await bcrypt.hash(password, 10);
      const [result] = await pool.execute('UPDATE users SET password = ? WHERE membership_id = ?', [hash, membershipId]);
      console.log(`${membershipId}: ${result.affectedRows ? 'password reset' : 'not found'}`);
    }
  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    await pool.end();
  }
})();
