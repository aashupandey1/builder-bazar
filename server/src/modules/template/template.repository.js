const db = require('../../core/config/db');

module.exports.findAll = async ({ sort, projectId, type, featured } = {}) => {
  const orderBy = sort === 'trending' ? 'usage_count DESC' : 'created_at DESC';
  const conditions = [];
  const params = [];
  if (projectId) {
    params.push(projectId);
    conditions.push(`project_id = $${params.length}`);
  }
  if (type) {
    params.push(type);
    conditions.push(`type = $${params.length}`);
  }
  if (featured) {
    conditions.push('is_featured = TRUE');
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await db.query(`SELECT * FROM templates ${where} ORDER BY ${orderBy}`, params);
  return result.rows;
};

module.exports.incrementUsage = async (id) => {
  await db.query('UPDATE templates SET usage_count = usage_count + 1 WHERE id = $1', [id]);
};

// Only one template can be featured at a time - single statement keeps it atomic.
// WHERE clause limits the update to the previously-featured row(s) + the new target,
// instead of touching every row in the table.
module.exports.setFeatured = async (id) => {
  await db.query(
    'UPDATE templates SET is_featured = (id = $1) WHERE is_featured = TRUE OR id = $1',
    [id]
  );
  const result = await db.query('SELECT * FROM templates WHERE id = $1', [id]);
  return result.rows[0] || null;
};