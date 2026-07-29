const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://486670fe45ae0568144fb48abb0f1f07@o4511817519333376.ingest.us.sentry.io/4511817581527040' });
module.exports = Sentry;
