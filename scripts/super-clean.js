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

console.log(`${colors.magenta}=== SUPER CLEAN: Thoroughly cleaning Vite and Node.js caches ===${colors.reset}`);

// Define paths to clear
const pathsToClear = [
  ['node_modules/.vite', 'Vite cache'],
  ['node_modules/.vite_fresh', 'Vite fresh cache'],
  ['node_modules/.cache', 'Node.js cache'],
  ['dist', 'build output'],
  ['.eslintcache', 'ESLint cache'],
  ['.tsbuildinfo', 'TypeScript build info'],
];

// Kill any running Vite processes
try {
  console.log(`${colors.yellow}Killing any running Vite processes...${colors.reset}`);
  execSync('pkill -f vite || true', { stdio: 'inherit' });
} catch (error) {
  // Ignore error if pkill is not available or no processes are found
}

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

// Delete problematic files
try {
  const problemFiles = [
    'src/components/EarningsCalendar.tsx',
  ];

  problemFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      console.log(`${colors.yellow}Removing problematic file: ${filePath}${colors.reset}`);
      fs.unlinkSync(fullPath);
      console.log(`${colors.green}✓ Successfully removed file${colors.reset}`);
    }
  });
} catch (error) {
  console.error(`${colors.red}Error removing problematic files: ${error.message}${colors.reset}`);
}

// Update dependencies
try {
  console.log(`${colors.yellow}Updating dependencies...${colors.reset}`);
  execSync('npm install', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Successfully updated dependencies${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error updating dependencies: ${error.message}${colors.reset}`);
}

// Clear browser caches by showing instructions
console.log(`\n${colors.cyan}===============================${colors.reset}`);
console.log(`${colors.cyan}STEP 1: Clear browser cache:${colors.reset}`);
console.log(`   1. Open browser Developer Tools (F12)`);
console.log(`   2. Go to Application/Storage tab`);
console.log(`   3. Select "Clear site data" or "Clear storage"`);
console.log(`   4. Check all boxes and click "Clear site data"`);

console.log(`\n${colors.cyan}STEP 2: Restart development server:${colors.reset}`);
console.log(`   Run: ${colors.green}npm run dev${colors.reset}`);

console.log(`\n${colors.cyan}STEP 3: Hard reload the page:${colors.reset}`);
console.log(`   Windows/Linux: ${colors.green}Ctrl+Shift+R${colors.reset}`);
console.log(`   Mac: ${colors.green}Cmd+Shift+R${colors.reset}`);
console.log(`${colors.cyan}===============================\n${colors.reset}`);

console.log(`${colors.green}✅ Super cleaning complete!${colors.reset}`);
