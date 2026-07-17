const repository = require('./notification-settings.repository');
const DEFAULTS = { user_id: null, push_enabled: true, email_enabled: true, sms_enabled: false };

module.exports.get = async (userId) => {
  const existing = await repository.findByUser(userId);
  return existing || { ...DEFAULTS, user_id: userId };
};

module.exports.update = (userId, { push_enabled, email_enabled, sms_enabled }) =>
  repository.upsert(userId, { pushEnabled: push_enabled, emailEnabled: email_enabled, smsEnabled: sms_enabled });