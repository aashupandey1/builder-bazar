const db = require('../../core/config/db');

module.exports.findAllByUser = async (userId) => {
  const result = await db.query('SELECT * FROM media WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return result.rows;
};

module.exports.create = async ({ userId, type, fileUrl }) => {
  const result = await db.query(
    'INSERT INTO media (user_id, type, file_url) VALUES ($1, $2, $3) RETURNING *',
    [userId, type, fileUrl]
  );
  return result.rows[0];
};