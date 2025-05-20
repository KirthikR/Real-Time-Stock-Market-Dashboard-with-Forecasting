import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { StockProvider } from './context/StockContext';
import { ThemeProvider } from './context/ThemeContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Import the SimpleErrorBoundary instead
import SimpleErrorBoundary from './components/SimpleErrorBoundary';
import DevTools from './components/DevTools';
import { suppressDevToolsMessage } from './utils/suppressDevToolsMessage';

// Suppress React DevTools console message before React initializes
suppressDevToolsMessage();

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Disable React DevTools console message in production
if (process.env.NODE_ENV === 'production') {
  if (typeof window !== 'undefined') {
    // @ts-ignore - Suppress certain console messages in production
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };
  }
}

// Initialize the app with all providers
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SimpleErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <StockProvider>
            <PortfolioProvider>
              <App />
              {/* DevTools notification component */}
              <DevTools />
            </PortfolioProvider>
          </StockProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SimpleErrorBoundary>
  </React.StrictMode>,
);
