// Validated environment variable loader - fail fast if required vars missing
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'CLIENT_URL',
];
required.forEach((key) => {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
});

module.exports = process.env;