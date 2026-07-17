const db = require('../../core/config/db');

module.exports.findAll = async () => {
  const result = await db.query(
    `SELECT p.id, p.name, p.location, p.address, COUNT(t.id)::int AS template_count
     FROM properties p
     LEFT JOIN templates t ON t.project_id = p.id
     GROUP BY p.id
     ORDER BY p.created_at DESC`
  );
  return result.rows;
};