const db = require('../../core/config/db');

module.exports.findByUser = async (userId) => {
  const result = await db.query(
    'SELECT user_id, company_name, tagline FROM branding WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
};

module.exports.upsert = async (userId, { companyName, tagline }) => {
  const result = await db.query(
    `INSERT INTO branding (user_id, company_name, tagline)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE
       SET company_name = EXCLUDED.company_name, tagline = EXCLUDED.tagline, updated_at = NOW()
     RETURNING user_id, company_name, tagline`,
    [userId, companyName, tagline ?? null]
  );
  return result.rows[0];
};