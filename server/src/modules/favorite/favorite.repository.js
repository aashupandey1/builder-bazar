const db = require('../../core/config/db');

module.exports.findAllByUser = async (userId) => {
  const result = await db.query(
    // audit §14: replaced bare t.subtitle with property + group context so favorites
    // show meaningful labels even after subtitle stops carrying group text.
    // subtitle column kept in SELECT for backward compat (existing client may read it).
    `SELECT t.id, t.type, t.title, t.subtitle, t.file_url, t.thumbnail_url,
            p.name AS property_name, p.secondary_name AS property_secondary_name, p.location AS property_location,
            g.name AS group_name, g.logo_url AS group_logo_url
     FROM favorites f
     JOIN templates t ON t.id = f.template_id
     LEFT JOIN properties p ON p.id = t.project_id
     LEFT JOIN groups g ON g.id = p.group_id
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