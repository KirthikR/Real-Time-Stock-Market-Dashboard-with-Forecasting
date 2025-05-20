import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Simple App component without any ErrorBoundary
function App() {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#3b82f6' }}>StockVision</h1>
      <p>This is a minimal working version to bypass the ErrorBoundary issue.</p>
      <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
      <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>Next Steps</h2>
        <p>With this working, you can gradually add back your components.</p>
        <ol style={{ lineHeight: 1.6 }}>
          <li>Start with core components like Header, StockList, etc.</li>
          <li>Add context providers one by one</li>
          <li>Test after each addition</li>
        </ol>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
