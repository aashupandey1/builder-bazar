const db = require('../../core/config/db');

const toThumbnail = (url, type) => {
  if (!url) return null;
  if (type !== 'Video' && type !== 'Reel') return url;
  return url.replace('/video/upload/', '/video/upload/so_0/').replace(/\.[^/.]+$/, '.jpg');
};

module.exports.findAll = async ({ grouped, groupId } = {}) => {
  if (grouped === 'true' || grouped === true) {
    const result = await db.query(
      `SELECT 
         COALESCE(p.group_id, -p.id) AS id,
         p.group_id,
         COALESCE(g.name, MAX(p.name)) AS name,
         g.logo_url AS logo_url,
         g.logo_url AS thumbnail_url,
         MAX(p.location) AS location,
         MAX(p.secondary_name) AS secondary_name,
         COUNT(t.id)::int AS template_count
       FROM listings p
       LEFT JOIN groups g ON g.id = p.group_id
       LEFT JOIN templates t ON t.listing_id = p.id
       GROUP BY COALESCE(p.group_id, -p.id), p.group_id, g.name, g.logo_url
       ORDER BY name ASC`
    );
    return result.rows;
  }

  const conditions = [];
  const params = [];
  if (groupId) {
    params.push(groupId);
    conditions.push(`p.group_id = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db.query(
    `SELECT p.id, p.name, p.location, p.address, p.secondary_name, p.category, p.group_id,
            g.name AS group_name, g.logo_url AS group_logo_url,
            COUNT(t.id)::int AS template_count,
            latest.file_url AS thumbnail_url, latest.type AS thumbnail_type
     FROM listings p
     LEFT JOIN groups g ON g.id = p.group_id
     LEFT JOIN templates t ON t.listing_id = p.id
     LEFT JOIN LATERAL (
       SELECT file_url, type FROM templates t2 WHERE t2.listing_id = p.id ORDER BY t2.created_at DESC LIMIT 1
     ) latest ON true
     ${where}
     GROUP BY p.id, g.name, g.logo_url, latest.file_url, latest.type
     ORDER BY p.created_at DESC`,
    params
  );
  return result.rows.map(({ thumbnail_type, ...row }) => ({
    ...row,
    thumbnail_url: toThumbnail(row.thumbnail_url, thumbnail_type),
  }));
};

module.exports.create = async ({ name, location, address, secondary_name, category, group_id }) => {
  const result = await db.query(
    `INSERT INTO listings (name, location, address, secondary_name, category, group_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (name, location, group_id) DO UPDATE SET name = EXCLUDED.name RETURNING *`,
    [name, location, address, secondary_name || null, category || null, group_id || null]
  );
  return result.rows[0];
};

module.exports.findSuggestions = async () => {
  const [names, locations, secondaryNames, groups] = await Promise.all([
    db.query(`SELECT DISTINCT name FROM listings WHERE name IS NOT NULL AND name <> '' ORDER BY name`),
    db.query(`SELECT DISTINCT location FROM listings WHERE location IS NOT NULL AND location <> '' ORDER BY location`),
    db.query(`SELECT DISTINCT secondary_name FROM listings WHERE secondary_name IS NOT NULL AND secondary_name <> '' ORDER BY secondary_name`),
    db.query(`SELECT name FROM groups WHERE name IS NOT NULL ORDER BY name`),
  ]);
  return {
    names: names.rows.map((r) => r.name),
    locations: locations.rows.map((r) => r.location),
    secondaryNames: secondaryNames.rows.map((r) => r.secondary_name),
    groups: groups.rows.map((r) => r.name),
  };
};

module.exports.update = async (id, fields) => {
  const keys = Object.keys(fields);
  if (!keys.length) return null;
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const result = await db.query(
    `UPDATE listings SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...keys.map((k) => fields[k])]
  );
  return result.rows[0] || null;
};

module.exports.remove = async (id) => {
  const result = await db.query('DELETE FROM listings WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};
