const db = require('../../core/config/db');

module.exports.findAll = async ({ sort, projectId, type, featured, limit = 10, offset = 0 } = {}) => {
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
  params.push(limit, offset);
  const result = await db.query(
    `SELECT * FROM templates ${where} ORDER BY ${orderBy} LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return result.rows;
};


// ponytail: one grouped-count query + one featured lookup, no separate stats table needed
module.exports.stats = async () => {
  const byType = await db.query('SELECT type, COUNT(*)::int AS count FROM templates GROUP BY type');
  const featured = await db.query('SELECT id, title, type FROM templates WHERE is_featured = TRUE LIMIT 1');
  return {
    total: byType.rows.reduce((sum, r) => sum + r.count, 0),
    byType: byType.rows,
    featured: featured.rows[0] || null,
  };
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

module.exports.create = async ({ type, title, subtitle, fileUrl, thumbnailUrl, createdBy, projectId }) => {
  const result = await db.query(
    `INSERT INTO templates (type, title, subtitle, file_url, thumbnail_url, created_by, project_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [type, title, subtitle, fileUrl, thumbnailUrl, createdBy, projectId || null]
  );
  return result.rows[0];
};

module.exports.findById = async (id) => {
  const result = await db.query('SELECT * FROM templates WHERE id = $1', [id]);
  return result.rows[0] || null;
};

module.exports.update = async (id, fields) => {
  const keys = Object.keys(fields);
  if (!keys.length) return module.exports.findById(id);
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const result = await db.query(
    `UPDATE templates SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...keys.map((k) => fields[k])]
  );
  return result.rows[0] || null;
};

module.exports.remove = async (id) => {
  const result = await db.query('DELETE FROM templates WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};