#!/usr/bin/env node

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

console.log(`${colors.magenta}=== Installing Dependencies ===${colors.reset}`);

// Install axios
try {
  console.log(`${colors.yellow}Installing axios...${colors.reset}`);
  execSync('npm install axios', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Successfully installed axios${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error installing axios: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Clear caches
try {
  console.log(`${colors.yellow}Clearing caches...${colors.reset}`);
  
  // Clear Vite cache
  if (require('fs').existsSync('node_modules/.vite')) {
    execSync('rm -rf node_modules/.vite', { stdio: 'inherit' });
  }
  
  console.log(`${colors.green}✓ Successfully cleared caches${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error clearing caches: ${error.message}${colors.reset}`);
}

console.log(`${colors.green}=== Installation Complete ===${colors.reset}`);
console.log(`${colors.cyan}You can now start the development server:${colors.reset}`);
console.log(`${colors.cyan}npm run dev${colors.reset}`);
