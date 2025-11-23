// File: utils/disableConsoleLogs.ts
// Purpose: Disable console logs in production to improve performance
// This is especially important when DevTools are open

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

// Check if we're in development mode
const isDevelopment = typeof __DEV__ !== 'undefined' && __DEV__;

/**
 * Disable console logs in production mode
 * Only errors will be kept for debugging critical issues
 */
export function disableConsoleLogs() {
  if (!isDevelopment) {
    // In production, disable log, info, debug, and warn
    // Keep error for critical issues
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    console.warn = () => {};
    
    // Keep console.error for critical issues
    // You can also disable it if needed: console.error = () => {};
  }
}

/**
 * Restore original console methods
 * Useful for debugging in production if needed
 */
export function enableConsoleLogs() {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
}

// Auto-disable on import in production
disableConsoleLogs();

