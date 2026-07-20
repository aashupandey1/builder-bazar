const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimiter = require('./core/middleware/rateLimiter');
const errorHandler = require('./core/middleware/error');
const auth = require('./core/middleware/auth');

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/storage', express.static(path.join(__dirname, '../storage')));

app.use('/api/v1/auth', rateLimiter, require('./modules/auth/auth.routes'));
app.use('/api/v1/templates', require('./modules/template/template.routes'));
app.use('/share', require('./modules/preview/preview.routes'));
app.use('/api/v1/properties', auth, require('./modules/property/property.routes'));
app.use('/api/v1/media', auth, require('./modules/media/media.routes'));
app.use('/api/v1/upload', auth, rateLimiter, require('./modules/upload/upload.routes'));
app.use('/api/v1/projects', auth, require('./modules/project/project.routes'));
app.use('/api/v1/favorites', auth, require('./modules/favorite/favorite.routes'));
app.use('/api/v1/profile', auth, require('./modules/profile/profile.routes'));
app.use('/api/v1/branding', auth, require('./modules/branding/branding.routes'));
app.use('/api/v1/notification-settings', auth, require('./modules/notification-settings/notification-settings.routes'));
app.use('/api/v1/notifications', auth, require('./modules/notification/notification.routes'));

app.use(errorHandler);

module.exports = app;