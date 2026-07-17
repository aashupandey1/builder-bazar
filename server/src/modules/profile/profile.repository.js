const db = require('../../core/config/db');

module.exports.findById = async (id) => {
  const result = await db.query(
    'SELECT id, name, email, phone, avatar_url FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

module.exports.update = async (id, { name, email, phone, avatarUrl }) => {
  const result = await db.query(
    `UPDATE users
     SET name = COALESCE($2, name),
         email = COALESCE($3, email),
         phone = COALESCE($4, phone),
         avatar_url = COALESCE($5, avatar_url),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, phone, avatar_url`,
    [id, name ?? null, email ?? null, phone ?? null, avatarUrl ?? null]
  );
  return result.rows[0] || null;
};