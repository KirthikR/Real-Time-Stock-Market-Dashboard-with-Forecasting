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

console.log(`${colors.yellow}⚠️ Clearing Vite and Node.js caches...${colors.reset}`);

// Define paths to clear
const pathsToClear = [
  ['node_modules/.vite', 'Vite cache'],
  ['node_modules/.cache', 'Build cache'],
];

// Clear each path
pathsToClear.forEach(([cachePath, description]) => {
  const fullPath = path.join(process.cwd(), cachePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      console.log(`${colors.cyan}Clearing ${description} at: ${fullPath}${colors.reset}`);
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`${colors.green}✓ Successfully cleared ${description}${colors.reset}`);
    } else {
      console.log(`${colors.blue}No ${description} found at: ${fullPath}${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error clearing ${description}: ${error.message}${colors.reset}`);
  }
});

// Update package-lock.json
try {
  console.log(`${colors.yellow}Updating package-lock.json...${colors.reset}`);
  execSync('npm install --package-lock-only', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Successfully updated package-lock.json${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error updating package-lock.json: ${error.message}${colors.reset}`);
}

console.log(`${colors.green}✅ Cache clearing complete. Please restart your dev server with:${colors.reset}`);
console.log(`${colors.cyan}npm run dev${colors.reset}`);
