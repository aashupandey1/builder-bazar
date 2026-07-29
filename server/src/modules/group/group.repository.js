const db = require('../../core/config/db');

module.exports.findAll = async () => {
  const result = await db.query(
    `SELECT id, name, logo_url, created_at FROM groups ORDER BY LOWER(name) ASC`
  );
  return result.rows;
};

// Kept separate from findAll to mirror property module pattern.
// Returns id + logo_url so UI can render logo thumbnails in the picker.
module.exports.findSuggestions = async () => {
  const result = await db.query(
    `SELECT id, name, logo_url FROM groups ORDER BY LOWER(name) ASC`
  );
  return result.rows;
};

module.exports.findById = async (id) => {
  const result = await db.query('SELECT * FROM groups WHERE id = $1', [id]);
  return result.rows[0] || null;
};

module.exports.create = async ({ name, logoUrl }) => {
  const result = await db.query(
    `INSERT INTO groups (name, logo_url) VALUES ($1, $2) RETURNING *`,
    [name, logoUrl || null]
  );
  return result.rows[0];
};

module.exports.update = async (id, fields) => {
  const keys = Object.keys(fields);
  if (!keys.length) return module.exports.findById(id);
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const result = await db.query(
    `UPDATE groups SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...keys.map((k) => fields[k])]
  );
  return result.rows[0] || null;
};

module.exports.remove = async (id) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE listings SET group_id = NULL WHERE group_id = $1', [id]);
    const result = await client.query('DELETE FROM groups WHERE id = $1 RETURNING *', [id]);
    await client.query('COMMIT');
    return result.rows[0] || null;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
