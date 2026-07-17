const db = require('../../core/config/db');

module.exports.findByUser = async (userId) => {
  const result = await db.query(
    'SELECT user_id, push_enabled, email_enabled, sms_enabled FROM notification_settings WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
};

module.exports.upsert = async (userId, { pushEnabled, emailEnabled, smsEnabled }) => {
  const result = await db.query(
    `INSERT INTO notification_settings (user_id, push_enabled, email_enabled, sms_enabled)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE
       SET push_enabled = COALESCE($2, notification_settings.push_enabled),
           email_enabled = COALESCE($3, notification_settings.email_enabled),
           sms_enabled = COALESCE($4, notification_settings.sms_enabled),
           updated_at = NOW()
     RETURNING user_id, push_enabled, email_enabled, sms_enabled`,
    [userId, pushEnabled ?? null, emailEnabled ?? null, smsEnabled ?? null]
  );
  return result.rows[0];
};