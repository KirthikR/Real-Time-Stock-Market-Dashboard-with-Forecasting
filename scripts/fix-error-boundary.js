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
  cyan: '\x1b[36m'
};

console.log(`${colors.yellow}=== Fixing ErrorBoundary Component ===${colors.reset}`);

// Kill any running Vite processes
try {
  console.log(`${colors.blue}Stopping Vite processes...${colors.reset}`);
  execSync('pkill -f vite || true', { stdio: 'ignore' });
} catch (error) {
  // Ignore errors from pkill
}

// Clear all cache directories
const cachesToDelete = [
  'node_modules/.vite',
  'node_modules/.cache',
  'dist'
];

cachesToDelete.forEach(cacheDir => {
  const fullPath = path.join(process.cwd(), cacheDir);
  if (fs.existsSync(fullPath)) {
    try {
      console.log(`${colors.blue}Removing cache: ${cacheDir}${colors.reset}`);
      fs.rmSync(fullPath, { recursive: true, force: true });
    } catch (error) {
      console.error(`${colors.red}Error removing ${cacheDir}: ${error.message}${colors.reset}`);
    }
  }
});

// Find the ErrorBoundary.tsx file
const errorBoundaryPath = path.join(process.cwd(), 'src/components/ErrorBoundary.tsx');

// Create a backup of the existing file if it exists
if (fs.existsSync(errorBoundaryPath)) {
  try {
    console.log(`${colors.blue}Creating backup of ErrorBoundary.tsx${colors.reset}`);
    fs.copyFileSync(errorBoundaryPath, `${errorBoundaryPath}.backup`);
  } catch (error) {
    console.error(`${colors.red}Failed to backup file: ${error.message}${colors.reset}`);
  }
}

// Create a super simple ErrorBoundary component
const ultraSimpleErrorBoundary = `import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
`;

try {
  console.log(`${colors.blue}Writing new ErrorBoundary.tsx${colors.reset}`);
  fs.writeFileSync(errorBoundaryPath, ultraSimpleErrorBoundary);
  console.log(`${colors.green}✓ Successfully created simplified ErrorBoundary${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Failed to write file: ${error.message}${colors.reset}`);
}

// Show next steps
console.log(`\n${colors.green}=== Fix Complete ===${colors.reset}`);
console.log(`${colors.cyan}Next steps:${colors.reset}`);
console.log(`  1. Run: ${colors.yellow}npm run dev${colors.reset}`);
console.log(`  2. If it works, you can gradually improve ErrorBoundary.tsx with more features${colors.reset}`);
console.log(`  3. If it still doesn't work, try: ${colors.yellow}npm install && npm run dev${colors.reset}`);
