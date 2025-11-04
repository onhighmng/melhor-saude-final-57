import * as Sentry from '@sentry/react';

/**
 * Test component to verify Sentry error tracking
 * 
 * Usage: Import and add to your app temporarily to test:
 * <SentryTestButton />
 * 
 * Remove after testing!
 */
export function SentryTestButton() {
  return (
    <button
      onClick={() => {
        throw new Error('🧪 This is a test error from Sentry Test Button!');
      }}
      style={{
        padding: '8px 16px',
        backgroundColor: '#ff4444',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
      }}
      title="Click to test Sentry error tracking"
    >
      🧪 Break the world (Sentry Test)
    </button>
  );
}

/**
 * Alternative: Manual message logging
 */
export function SentryTestMessages() {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <button
        onClick={() => {
          Sentry.captureMessage('Test info message', 'info');
          alert('✅ Info message sent to Sentry');
        }}
        style={{
          padding: '8px 12px',
          backgroundColor: '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        Test Info
      </button>

      <button
        onClick={() => {
          Sentry.captureMessage('Test warning message', 'warning');
          alert('⚠️ Warning message sent to Sentry');
        }}
        style={{
          padding: '8px 12px',
          backgroundColor: '#ff9900',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        Test Warning
      </button>

      <button
        onClick={() => {
          Sentry.captureMessage('Test error message', 'error');
          alert('❌ Error message sent to Sentry');
        }}
        style={{
          padding: '8px 12px',
          backgroundColor: '#cc0000',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        Test Error
      </button>

      <button
        onClick={() => {
          try {
            throw new Error('🧪 Test error with context');
          } catch (error) {
            Sentry.captureException(error, {
              contexts: {
                test: {
                  type: 'manual_test',
                  timestamp: new Date().toISOString(),
                },
              },
            });
            alert('✅ Exception sent to Sentry');
          }
        }}
        style={{
          padding: '8px 12px',
          backgroundColor: '#9933cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        Test Exception
      </button>
    </div>
  );
}



