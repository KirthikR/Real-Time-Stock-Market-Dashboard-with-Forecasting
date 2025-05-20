import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';

// This component provides a user-friendly notification about React DevTools instead of console messages
const DevTools: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // Only apply in development environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    setIsDev(isDevelopment);
    
    if (!isDevelopment) return;
    
    // Check if React DevTools is installed
    const hasDevTools = 
      typeof window !== 'undefined' && 
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== undefined && 
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.isDisabled !== true;
    
    // Only show warning in development and when DevTools is not installed
    setShowWarning(!hasDevTools);

    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close warning with Escape key
      if (e.key === 'Escape') {
        setShowWarning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isDev || !showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md bg-yellow-900/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-yellow-600/50 text-white">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium mb-1">React DevTools Missing</h3>
          <p className="text-xs text-yellow-200">
            Install React DevTools for a better development experience:
          </p>
          <div className="mt-2 space-y-1">
            <a 
              href="https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center px-2 py-1 bg-yellow-800/50 hover:bg-yellow-700/50 rounded"
            >
              <span>Install for Chrome</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
            <a 
              href="https://addons.mozilla.org/en-US/firefox/addon/react-devtools/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center px-2 py-1 bg-yellow-800/50 hover:bg-yellow-700/50 rounded"
            >
              <span>Install for Firefox</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
          <div className="mt-2 text-xs text-yellow-300/80">
            After installation, reload this page and the warning will be gone.
          </div>
        </div>
        <button 
          onClick={() => setShowWarning(false)}
          className="ml-2 text-yellow-400 hover:text-yellow-300"
          aria-label="Close warning"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Add a global type declaration for the React DevTools hook
declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      isDisabled?: boolean;
    };
  }
}

export default DevTools;
