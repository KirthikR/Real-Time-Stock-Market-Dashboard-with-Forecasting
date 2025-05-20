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

console.log(`${colors.magenta}=== NUCLEAR PROJECT REBUILD ===${colors.reset}`);

// Define the root directory
const rootDir = process.cwd();
const tempDir = path.join(rootDir, '_temp_rebuild');
const srcDir = path.join(rootDir, 'src');
const componentsDir = path.join(srcDir, 'components');

// 1. Kill all running processes
try {
  console.log(`${colors.yellow}Stopping all processes...${colors.reset}`);
  execSync('pkill -f vite || true', { stdio: 'ignore' });
  execSync('pkill -f node || true', { stdio: 'ignore' });
  console.log(`${colors.green}✓ Processes stopped${colors.reset}`);
} catch (error) {
  // Ignore errors here
}

// 2. Create temporary directory
try {
  console.log(`${colors.yellow}Creating temporary directory...${colors.reset}`);
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });
  fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
  console.log(`${colors.green}✓ Temporary directory created${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error creating temporary directory: ${error.message}${colors.reset}`);
  process.exit(1);
}

// 3. Delete all caches
const cachesToClear = [
  'node_modules/.vite',
  'node_modules/.vite_fresh',
  'node_modules/.cache',
  '.eslintcache',
  'dist'
];

console.log(`${colors.yellow}Clearing all caches...${colors.reset}`);
cachesToClear.forEach(cache => {
  const cachePath = path.join(rootDir, cache);
  if (fs.existsSync(cachePath)) {
    try {
      fs.rmSync(cachePath, { recursive: true, force: true });
    } catch (error) {
      console.error(`${colors.red}Error clearing ${cache}: ${error.message}${colors.reset}`);
    }
  }
});

// 4. Create a new minimal index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stock Market Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.js"></script>
  </body>
</html>
`;

try {
  fs.writeFileSync(path.join(tempDir, 'index.html'), indexHtml);
  console.log(`${colors.green}✓ Created new index.html${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error creating index.html: ${error.message}${colors.reset}`);
}

// 5. Create minimal React entry point
const indexJs = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Minimal App component 
function App() {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#3b82f6' }}>Stock Market Dashboard</h1>
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
`;

// 6. Create minimal CSS
const indexCss = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f0f2f5;
  color: #333;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
`;

// Create src directory and write files
try {
  fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(tempDir, 'src', 'index.js'), indexJs);
  fs.writeFileSync(path.join(tempDir, 'src', 'index.css'), indexCss);
  console.log(`${colors.green}✓ Created minimal React application${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error creating React files: ${error.message}${colors.reset}`);
}

// 7. Create minimal vite config
const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
});
`;

try {
  fs.writeFileSync(path.join(tempDir, 'vite.config.js'), viteConfig);
  console.log(`${colors.green}✓ Created vite.config.js${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error creating vite.config.js: ${error.message}${colors.reset}`);
}

// 8. Update package.json for temp rebuild
const packageJson = require(path.join(rootDir, 'package.json'));
packageJson.scripts = {
  ...packageJson.scripts,
  "temp-dev": "cd _temp_rebuild && vite"
};

try {
  fs.writeFileSync(
    path.join(rootDir, 'package.json'), 
    JSON.stringify(packageJson, null, 2)
  );
  console.log(`${colors.green}✓ Updated package.json with temp-dev script${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error updating package.json: ${error.message}${colors.reset}`);
}

console.log(`\n${colors.green}=== NUCLEAR REBUILD COMPLETE ===${colors.reset}`);
console.log(`${colors.cyan}To run the minimal application:${colors.reset}`);
console.log(`  ${colors.yellow}npm run temp-dev${colors.reset}`);
console.log(`\n${colors.cyan}After confirming it works, gradually add your components back${colors.reset}`);
console.log(`${colors.cyan}from your original 'src' directory to the new '_temp_rebuild/src' directory.${colors.reset}`);
