// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    // Only send errors from production builds — dev errors are noisy
    enabled: process.env.NODE_ENV === 'production',
    // Sample rate for error capture (1.0 = 100%)
    sampleRate: 1.0,
    // Sample rate for performance traces (0.1 = 10% of transactions)
    tracesSampleRate: 0.1,
    // Replays — capture user sessions for debugging (only in production)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Integrations
    integrations: [
      // Session replay for debugging user sessions
      Sentry.replayIntegration(),
      // Browser profiling integration
      Sentry.browserProfilingIntegration(),
    ],
    // Ignore common non-actionable errors
    ignoreErrors: [
      // Wallet extensions inject errors on page load
      'chrome-extension://',
      'moz-extension://',
      // MetaMask / WalletConnect connection issues
      'User rejected the request',
      'User denied',
      'MetaMask',
      // Network connectivity issues outside our control
      'NetworkError',
      'Failed to fetch',
      // Common browser extension noise
      'ResizeObserver loop',
      'ResizeObserver loop limit exceeded',
    ],
  })
}
