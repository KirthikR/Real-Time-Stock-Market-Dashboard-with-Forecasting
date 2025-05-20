#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

console.log(`${colors.magenta}=== Starting Fresh Setup ===${colors.reset}`);

// Stop any running processes
try {
  console.log(`${colors.yellow}Stopping any running Vite processes...${colors.reset}`);
  execSync('pkill -f vite || true');
  console.log(`${colors.green}✓ Processes stopped${colors.reset}`);
} catch (error) {
  // Ignore errors here
}

// Clear caches
const cachesToClear = [
  'node_modules/.vite',
  'node_modules/.vite_fresh',
  'node_modules/.cache',
  '.eslintcache'
];

console.log(`${colors.yellow}Clearing caches...${colors.reset}`);
cachesToClear.forEach(cache => {
  const cachePath = path.join(process.cwd(), cache);
  if (fs.existsSync(cachePath)) {
    try {
      fs.rmSync(cachePath, { recursive: true, force: true });
      console.log(`${colors.green}✓ Cleared ${cache}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error clearing ${cache}: ${error.message}${colors.reset}`);
    }
  }
});

// Check if file exists and backup
const errorBoundaryPath = path.join(process.cwd(), 'src/components/ErrorBoundary.tsx');
if (fs.existsSync(errorBoundaryPath)) {
  try {
    const backupPath = `${errorBoundaryPath}.bak`;
    fs.copyFileSync(errorBoundaryPath, backupPath);
    console.log(`${colors.green}✓ Created backup of ErrorBoundary.tsx as ErrorBoundary.tsx.bak${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error backing up ErrorBoundary.tsx: ${error.message}${colors.reset}`);
  }
}

console.log(`${colors.yellow}Creating simplified ErrorBoundary component...${colors.reset}`);

// Create simplified ErrorBoundary
const simplifiedErrorBoundary = `import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid #ff5555',
          borderRadius: '5px',
          backgroundColor: '#ffeeee'
        }}>
          <h2 style={{ color: '#ff0000' }}>Something went wrong</h2>
          <p style={{ color: '#333333' }}>
            {this.state.error && this.state.error.toString()}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0066cc',
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

export default ErrorBoundary;
`;

fs.writeFileSync(errorBoundaryPath, simplifiedErrorBoundary);
console.log(`${colors.green}✓ Created simplified ErrorBoundary component${colors.reset}`);

console.log(`${colors.yellow}Starting development server...${colors.reset}`);
console.log(`${colors.green}✓ Fresh setup complete${colors.reset}`);
console.log(`${colors.cyan}Run 'npm run dev' to start the development server${colors.reset}`);
