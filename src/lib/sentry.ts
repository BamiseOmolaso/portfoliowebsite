import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/yourdomain\.com/],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  beforeSend(event) {
    // Filter out sensitive information
    if (event.request?.data) {
      delete event.request.data;
    }
    return event;
  },
}); 