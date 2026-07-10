'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            background: '#f9f8f6',
            color: '#23201a',
          }}
        >
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <p
              style={{
                fontSize: '14px',
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
                color: '#8a867e',
                marginBottom: 12,
              }}
            >
              ANIMA
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 300, margin: 0, lineHeight: 1.1 }}>
              Something went wrong
            </h1>
            <p
              style={{
                marginTop: 16,
                fontSize: 15,
                lineHeight: 1.6,
                color: '#5c5850',
              }}
            >
              This error has been reported. Try reloading the page, or come back later.
            </p>
            <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => reset()}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#23201a',
                  color: '#f9f8f6',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: '1px solid #d6d2ca',
                  background: 'transparent',
                  color: '#23201a',
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Go home
              </a>
            </div>
            {error.digest && (
              <p
                style={{
                  marginTop: 24,
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: '#8a867e',
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
