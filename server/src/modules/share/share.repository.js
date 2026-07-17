// Database query layer - only this file knows SQL/ORM syntax for share
const db = require('../../core/config/db');

module.exports.findAll = async () => {
  const result = await db.query('SELECT * FROM shares');
  return result.rows;
};
