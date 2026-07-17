// Database query layer - only this file knows SQL/ORM syntax for project
const db = require('../../core/config/db');

module.exports.findAllByUser = async (userId) => {
  const result = await db.query(
    `SELECT id, user_id, template_id, title, thumbnail_url, created_at, updated_at
     FROM projects
     WHERE user_id = $1
     ORDER BY updated_at DESC`,
    [userId]
  );
  return result.rows;
};

module.exports.findById = async (id) => {
  const result = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
  return result.rows[0] || null;
};

module.exports.create = async ({ userId, templateId, title, data }) => {
  const result = await db.query(
    `INSERT INTO projects (user_id, template_id, title, data)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, templateId || null, title || null, data]
  );
  return result.rows[0];
};

module.exports.update = async (id, { title, data }) => {
  const result = await db.query(
    `UPDATE projects
     SET title = COALESCE($2, title),
         data = COALESCE($3, data),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, title ?? null, data ?? null]
  );
  return result.rows[0] || null;
};

module.exports.remove = async (id) => {
  await db.query('DELETE FROM projects WHERE id = $1', [id]);
};