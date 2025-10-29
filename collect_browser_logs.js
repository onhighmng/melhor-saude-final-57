/**
 * Browser Console Log Collector
 * Run this in your browser console to collect authentication logs
 * Then save to a file and analyze with debug_login_with_ai.py
 */

(function() {
  const logs = {
    timestamp: new Date().toISOString(),
    authEvents: [],
    protectedRouteLogs: [],
    errors: [],
    profileLoadAttempts: [],
    networkRequests: []
  };

  // Intercept console.log for AuthContext and ProtectedRoute
  const originalLog = console.log;
  console.log = function(...args) {
    const message = args.join(' ');
    
    if (message.includes('[AuthContext]')) {
      logs.authEvents.push({
        timestamp: new Date().toISOString(),
        message: message,
        details: args.slice(1)
      });
    }
    
    if (message.includes('[ProtectedRoute]')) {
      logs.protectedRouteLogs.push({
        timestamp: new Date().toISOString(),
        message: message,
        details: args.slice(1)
      });
    }
    
    originalLog.apply(console, args);
  };

  // Capture errors
  const originalError = console.error;
  console.error = function(...args) {
    logs.errors.push({
      timestamp: new Date().toISOString(),
      error: args.join(' ')
    });
    originalError.apply(console, args);
  };

  // Monitor network requests
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0];
    if (url.includes('supabase') || url.includes('auth')) {
      const startTime = Date.now();
      try {
        const response = await originalFetch(...args);
        logs.networkRequests.push({
          timestamp: new Date().toISOString(),
          url: url,
          status: response.status,
          duration: Date.now() - startTime,
          success: response.ok
        });
        return response;
      } catch (error) {
        logs.networkRequests.push({
          timestamp: new Date().toISOString(),
          url: url,
          error: error.message,
          duration: Date.now() - startTime,
          success: false
        });
        throw error;
      }
    }
    return originalFetch(...args);
  };

  // Export function
  window.getAuthLogs = function() {
    console.log('%c[AUTH LOGS] Collection complete!', 'color: green; font-weight: bold;');
    console.log('Copy the following JSON and save it to a file:');
    console.log(JSON.stringify(logs, null, 2));
    
    // Also copy to clipboard if available
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(logs, null, 2)).then(() => {
        console.log('%c[AUTH LOGS] Logs copied to clipboard!', 'color: green;');
      });
    }
    
    return logs;
  };

  console.log('%c[AUTH LOGS] Log collection started!', 'color: blue; font-weight: bold;');
  console.log('%c[AUTH LOGS] Perform your login attempt, then run: getAuthLogs()', 'color: blue;');
})();

