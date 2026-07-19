const db = require('../../core/config/db');

module.exports.findAll = async () => {
  const result = await db.query(
    `SELECT p.id, p.name, p.location, p.address, COUNT(t.id)::int AS template_count,
            (SELECT t2.file_url FROM templates t2 WHERE t2.project_id = p.id ORDER BY t2.created_at DESC LIMIT 1) AS thumbnail_url
     FROM properties p
     LEFT JOIN templates t ON t.project_id = p.id
     GROUP BY p.id
     ORDER BY p.created_at DESC`
  );
  return result.rows;
};

module.exports.create = async ({ name, location, address }) => {
  const result = await db.query(
    `INSERT INTO properties (name, location, address) VALUES ($1, $2, $3) RETURNING *`,
    [name, location, address]
  );
  return result.rows[0];
};

module.exports.update = async (id, fields) => {
  const keys = Object.keys(fields);
  if (!keys.length) return null;
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const result = await db.query(
    `UPDATE properties SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...keys.map((k) => fields[k])]
  );
  return result.rows[0] || null;
};

module.exports.remove = async (id) => {
  const result = await db.query('DELETE FROM properties WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};