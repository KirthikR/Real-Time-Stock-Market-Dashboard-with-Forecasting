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

console.log(`${colors.magenta}=== COMPLETE APPLICATION FIX ===${colors.reset}`);

// Kill all Vite processes
try {
  console.log(`${colors.yellow}Stopping all Vite processes...${colors.reset}`);
  execSync('pkill -f vite || true', { stdio: 'ignore' });
  console.log(`${colors.green}✓ Processes stopped${colors.reset}`);
} catch (error) {
  // Ignore errors here
}

// Delete caches
const cachesToClear = [
  'node_modules/.vite',
  'node_modules/.vite_fresh',
  'node_modules/.cache',
  '.eslintcache',
  'dist'
];

console.log(`${colors.yellow}Clearing all caches...${colors.reset}`);
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

// COMPLETELY REMOVE the problematic file
const errorBoundaryPath = path.join(process.cwd(), 'src/components/ErrorBoundary.tsx');
try {
  if (fs.existsSync(errorBoundaryPath)) {
    console.log(`${colors.yellow}Removing problematic ErrorBoundary.tsx...${colors.reset}`);
    fs.unlinkSync(errorBoundaryPath);
    console.log(`${colors.green}✓ Removed ErrorBoundary.tsx${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}Error removing file: ${error.message}${colors.reset}`);
}

// Create the simplest possible ErrorBoundary component
console.log(`${colors.yellow}Creating new minimal ErrorBoundary.tsx...${colors.reset}`);
const minimalErrorBoundary = `import React from 'react';

// The simplest possible error boundary
export class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error caught by boundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
`;

try {
  fs.writeFileSync(errorBoundaryPath, minimalErrorBoundary);
  console.log(`${colors.green}✓ Created new ErrorBoundary.tsx${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error creating file: ${error.message}${colors.reset}`);
}

// Update main.tsx to use regular import
const mainTsxPath = path.join(process.cwd(), 'src/main.tsx');
try {
  if (fs.existsSync(mainTsxPath)) {
    console.log(`${colors.yellow}Updating main.tsx...${colors.reset}`);
    let mainContent = fs.readFileSync(mainTsxPath, 'utf8');
    
    // Replace any import of ErrorBoundary with our correct import
    mainContent = mainContent.replace(
      /import.*ErrorBoundary.*from.*ErrorBoundary.*|import.*SimpleErrorBoundary.*from.*SimpleErrorBoundary.*/g,
      `import ErrorBoundary from './components/ErrorBoundary';`
    );
    
    // Also replace any usage of SimpleErrorBoundary with ErrorBoundary
    mainContent = mainContent.replace(
      /<SimpleErrorBoundary>/g,
      `<ErrorBoundary>`
    );
    
    mainContent = mainContent.replace(
      /<\/SimpleErrorBoundary>/g,
      `</ErrorBoundary>`
    );
    
    fs.writeFileSync(mainTsxPath, mainContent);
    console.log(`${colors.green}✓ Updated main.tsx${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}Error updating main.tsx: ${error.message}${colors.reset}`);
}

// Update App.tsx if it exists
const appTsxPath = path.join(process.cwd(), 'src/App.tsx');
try {
  if (fs.existsSync(appTsxPath)) {
    console.log(`${colors.yellow}Updating App.tsx...${colors.reset}`);
    let appContent = fs.readFileSync(appTsxPath, 'utf8');
    
    // Replace any import of ErrorBoundary
    appContent = appContent.replace(
      /import.*ErrorBoundary.*from.*ErrorBoundary.*|import.*SimpleErrorBoundary.*from.*SimpleErrorBoundary.*/g,
      `import ErrorBoundary from './components/ErrorBoundary';`
    );
    
    // Fix the curly braces import if present
    appContent = appContent.replace(
      /import.*\{.*ErrorBoundary.*\}.*from/g,
      `import ErrorBoundary from`
    );
    
    fs.writeFileSync(appTsxPath, appContent);
    console.log(`${colors.green}✓ Updated App.tsx${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}Error updating App.tsx: ${error.message}${colors.reset}`);
}

// Clean TypeScript cache
try {
  console.log(`${colors.yellow}Cleaning TypeScript cache...${colors.reset}`);
  execSync('rm -f tsconfig.tsbuildinfo', { stdio: 'inherit' });
  console.log(`${colors.green}✓ TypeScript cache cleaned${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error cleaning TypeScript cache: ${error.message}${colors.reset}`);
}

console.log(`\n${colors.green}✅ FIX COMPLETE!${colors.reset}`);
console.log(`${colors.cyan}Try running the application:${colors.reset}`);
console.log(`  ${colors.yellow}npm run dev${colors.reset}`);
console.log(`\n${colors.cyan}If issues persist, try the nuclear option:${colors.reset}`);
console.log(`  ${colors.yellow}1. Stop all running processes${colors.reset}`);
console.log(`  ${colors.yellow}2. Run: rm -rf node_modules${colors.reset}`);
console.log(`  ${colors.yellow}3. Run: npm install${colors.reset}`);
console.log(`  ${colors.yellow}4. Run: npm run dev${colors.reset}`);
