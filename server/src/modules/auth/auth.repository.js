// Database query layer - only this file knows SQL/ORM syntax for auth
const db = require('../../core/config/db');

module.exports.findAll = async () => {
  const result = await db.query('SELECT * FROM auths');
  return result.rows;
};
