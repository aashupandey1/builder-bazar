// Vite entry point - mounts React to DOM
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://82e0a23c2f566cae6209d48dd672895d@o4511817519333376.ingest.us.sentry.io/4511817529032704',
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
