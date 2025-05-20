/**
 * This utility suppresses the React DevTools installation message in the console
 * while providing an improved in-app notification instead.
 */

export const suppressDevToolsMessage = (): void => {
  // Only apply in development mode
  if (process.env.NODE_ENV !== 'development') return;

  // Check if DevTools is already installed
  const isDevToolsInstalled = 
    typeof window !== 'undefined' && 
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && 
    !window.__REACT_DEVTOOLS_GLOBAL_HOOK__.isDisabled;

  // If already installed, no need to suppress anything
  if (isDevToolsInstalled) return;
  
  // Store original console methods
  const originalConsoleLog = console.log;
  const originalConsoleInfo = console.info;
  
  // Pattern to match React DevTools message
  const devToolsPattern = /download the react devtools/i;
  
  // Override console.log to filter out the React DevTools message
  console.log = function(...args) {
    if (args.length > 0 && 
        typeof args[0] === 'string' && 
        devToolsPattern.test(args[0])) {
      // Prevent the message from showing
      return;
    }
    return originalConsoleLog.apply(console, args);
  };
  
  // Also override console.info as React might use this in the future
  console.info = function(...args) {
    if (args.length > 0 && 
        typeof args[0] === 'string' && 
        devToolsPattern.test(args[0])) {
      // Prevent the message from showing
      return;
    }
    return originalConsoleInfo.apply(console, args);
  };
  
  // Add a cleanup method in case we need to restore original behavior
  window.__RESTORE_CONSOLE__ = () => {
    console.log = originalConsoleLog;
    console.info = originalConsoleInfo;
    delete window.__RESTORE_CONSOLE__;
  };
};

// Type declaration for the global window object
declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      isDisabled?: boolean;
    };
    __RESTORE_CONSOLE__?: () => void;
  }
}

export default suppressDevToolsMessage;
