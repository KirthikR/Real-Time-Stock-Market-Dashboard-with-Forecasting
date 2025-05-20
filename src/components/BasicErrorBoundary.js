import React from 'react';

// Using plain JS instead of TypeScript to avoid any type-related issues
class BasicErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          margin: '20px',
          padding: '20px',
          border: '1px solid red',
          borderRadius: '5px',
          backgroundColor: '#ffeeee'
        }}>
          <h3 style={{ color: 'red' }}>Something went wrong</h3>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default BasicErrorBoundary;
