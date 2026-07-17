// Database query layer - only this file knows SQL/ORM syntax for favorite
const db = require('../../core/config/db');

module.exports.findAllByUser = async (userId) => {
  const result = await db.query(
    `SELECT p.id, p.title, p.template_id, p.thumbnail_url, p.updated_at
     FROM favorites f
     JOIN projects p ON p.id = f.project_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
};

module.exports.add = async (userId, projectId) => {
  await db.query(
    `INSERT INTO favorites (user_id, project_id) VALUES ($1, $2)
     ON CONFLICT (user_id, project_id) DO NOTHING`,
    [userId, projectId]
  );
};

module.exports.remove = async (userId, projectId) => {
  await db.query('DELETE FROM favorites WHERE user_id = $1 AND project_id = $2', [userId, projectId]);
};