const db = require('../../core/config/db');

// Ensure categories table exists and seed default choices if table is empty
const initTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    const countRes = await db.query('SELECT COUNT(*)::int AS count FROM categories');
    if (countRes.rows[0].count === 0) {
      const defaults = ['Residential', 'Commercial', 'Villa', 'Plot', 'Other'];
      for (const name of defaults) {
        await db.query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT DO NOTHING', [name]);
      }
    }
  } catch (err) {
    console.error('Failed to initialize categories table:', err);
  }
};

initTable();

module.exports.findAll = async () => {
  const result = await db.query('SELECT id, name, created_at FROM categories ORDER BY LOWER(name) ASC');
  return result.rows;
};

module.exports.findById = async (id) => {
  const result = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
  return result.rows[0] || null;
};

module.exports.create = async ({ name }) => {
  const result = await db.query(
    'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING *',
    [name]
  );
  return result.rows[0];
};

module.exports.update = async (id, fields) => {
  const keys = Object.keys(fields);
  if (!keys.length) return module.exports.findById(id);
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const result = await db.query(
    `UPDATE categories SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...keys.map((k) => fields[k])]
  );
  return result.rows[0] || null;
};

module.exports.remove = async (idOrName) => {
  let result;
  if (!isNaN(idOrName)) {
    result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [parseInt(idOrName, 10)]);
  } else {
    result = await db.query('DELETE FROM categories WHERE LOWER(name) = LOWER($1) RETURNING *', [idOrName]);
  }
  return result.rows[0] || null;
};
