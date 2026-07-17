const db = require('../../core/config/db');

module.exports.findAllByUser = async (userId) => {
  const result = await db.query(
    `SELECT id, title, message, type, is_read, created_at
     FROM notifications WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

module.exports.markRead = async (userId, id) => {
  const result = await db.query(
    `UPDATE notifications SET is_read = TRUE
     WHERE id = $1 AND user_id = $2
     RETURNING id, title, message, type, is_read, created_at`,
    [id, userId]
  );
  return result.rows[0] || null;
};

module.exports.markAllRead = async (userId) => {
  await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [userId]);
};