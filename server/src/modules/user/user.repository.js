const db = require('../../core/config/db');

module.exports.findAll = async () => {
  const result = await db.query('SELECT * FROM users');
  return result.rows;
};

module.exports.findById = async (id) => {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

module.exports.upsertGoogleUser = async ({ googleId, email, name, avatarUrl }) => {
  const result = await db.query(
    `INSERT INTO users (google_id, email, name, avatar_url, provider)
     VALUES ($1, $2, $3, $4, 'google')
     ON CONFLICT (google_id) DO UPDATE
       SET name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url, updated_at = NOW()
     RETURNING *`,
    [googleId, email, name, avatarUrl]
  );
  return result.rows[0];
};