const db = require('../../core/config/db');

module.exports.findAllByUser = async (userId) => {
  const result = await db.query(
    `SELECT t.id, t.type, t.title, t.subtitle, t.file_url, t.thumbnail_url
     FROM favorites f
     JOIN templates t ON t.id = f.template_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
};

module.exports.add = async (userId, templateId) => {
  await db.query(
    `INSERT INTO favorites (user_id, template_id) VALUES ($1, $2)
     ON CONFLICT (user_id, template_id) DO NOTHING`,
    [userId, templateId]
  );
};

module.exports.remove = async (userId, templateId) => {
  await db.query('DELETE FROM favorites WHERE user_id = $1 AND template_id = $2', [userId, templateId]);
};