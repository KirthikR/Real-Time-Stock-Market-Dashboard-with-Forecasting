#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.yellow}=== RENAMING ERROR BOUNDARY REFERENCES ===${colors.reset}`);

// Force stop any processes that might be locking files
try {
  console.log(`${colors.yellow}Stopping any running processes...${colors.reset}`);
  execSync('pkill -f vite || true', { stdio: 'ignore' });
} catch (error) {
  // Ignore errors here
}

// Delete the problematic file
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

// Delete any cached versions
const cachesToClear = [
  'node_modules/.vite',
  'node_modules/.cache',
  '.tsbuildinfo'
];

cachesToClear.forEach(cache => {
  const cachePath = path.join(process.cwd(), cache);
  if (fs.existsSync(cachePath)) {
    try {
      fs.rmSync(cachePath, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors
    }
  }
});

// Update references in App.tsx
const appTsxPath = path.join(process.cwd(), 'src/App.tsx');
if (fs.existsSync(appTsxPath)) {
  try {
    let content = fs.readFileSync(appTsxPath, 'utf8');
    
    // Update import statements
    content = content.replace(
      /import.*ErrorBoundary.*from.*ErrorBoundary.*;/g,
      `import BasicErrorBoundary from './components/BasicErrorBoundary';`
    );
    
    // Update any destructured imports
    content = content.replace(
      /import.*{.*ErrorBoundary.*}.*from.*ErrorBoundary.*;/g,
      `import BasicErrorBoundary from './components/BasicErrorBoundary';`
    );
    
    // Update usage in JSX
    content = content.replace(/<ErrorBoundary/g, '<BasicErrorBoundary');
    content = content.replace(/<\/ErrorBoundary>/g, '</BasicErrorBoundary>');
    
    fs.writeFileSync(appTsxPath, content);
    console.log(`${colors.green}✓ Updated App.tsx${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error updating App.tsx: ${error.message}${colors.reset}`);
  }
}

// Update references in main.tsx
const mainTsxPath = path.join(process.cwd(), 'src/main.tsx');
if (fs.existsSync(mainTsxPath)) {
  try {
    let content = fs.readFileSync(mainTsxPath, 'utf8');
    
    // Update import statements
    content = content.replace(
      /import.*ErrorBoundary.*from.*ErrorBoundary.*;|import.*SimpleErrorBoundary.*from.*SimpleErrorBoundary.*;/g,
      `import BasicErrorBoundary from './components/BasicErrorBoundary';`
    );
    
    // Update usage in JSX
    content = content.replace(/<ErrorBoundary|<SimpleErrorBoundary/g, '<BasicErrorBoundary');
    content = content.replace(/<\/ErrorBoundary>|<\/SimpleErrorBoundary>/g, '</BasicErrorBoundary>');
    
    fs.writeFileSync(mainTsxPath, content);
    console.log(`${colors.green}✓ Updated main.tsx${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error updating main.tsx: ${error.message}${colors.reset}`);
  }
}

console.log(`\n${colors.green}=== RENAMING COMPLETE ===${colors.reset}`);
console.log(`${colors.cyan}Now try running:${colors.reset}`);
console.log(`${colors.yellow}npm run dev${colors.reset}`);
