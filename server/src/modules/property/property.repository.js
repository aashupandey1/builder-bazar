const db = require('../../core/config/db');

module.exports.findAll = async () => {
  const result = await db.query(
    `SELECT p.id, p.name, p.location, p.address, p.secondary_name, COUNT(t.id)::int AS template_count,
            (SELECT t2.file_url FROM templates t2 WHERE t2.project_id = p.id ORDER BY t2.created_at DESC LIMIT 1) AS thumbnail_url
     FROM properties p
     LEFT JOIN templates t ON t.project_id = p.id
     GROUP BY p.id
     ORDER BY p.created_at DESC`
  );
  return result.rows;
};

module.exports.create = async ({ name, location, address, secondary_name, category }) => {
  const result = await db.query(
    `INSERT INTO properties (name, location, address, secondary_name, category) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (name, location) DO UPDATE SET name = EXCLUDED.name RETURNING *`,
    [name, location, address, secondary_name || null, category || null]
  );
  return result.rows[0];
};

module.exports.findSuggestions = async () => {
  const [names, locations, secondaryNames] = await Promise.all([
    db.query(`SELECT DISTINCT name FROM properties WHERE name IS NOT NULL AND name <> '' ORDER BY name`),
    db.query(`SELECT DISTINCT location FROM properties WHERE location IS NOT NULL AND location <> '' ORDER BY location`),
    db.query(`SELECT DISTINCT secondary_name FROM properties WHERE secondary_name IS NOT NULL AND secondary_name <> '' ORDER BY secondary_name`),
  ]);
  return {
    names: names.rows.map((r) => r.name),
    locations: locations.rows.map((r) => r.location),
    secondaryNames: secondaryNames.rows.map((r) => r.secondary_name),
  };
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