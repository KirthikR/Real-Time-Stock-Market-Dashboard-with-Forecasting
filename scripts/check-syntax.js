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

console.log(`${colors.magenta}=== Checking for TypeScript Syntax Errors ===${colors.reset}`);

// Define directories to check
const dirsToCheck = [
  'src/components',
  'src/context',
  'src/utils',
  'src/services',
  'src'
];

// Check each directory
let hasErrors = false;

dirsToCheck.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`${colors.yellow}Directory ${dir} does not exist, skipping...${colors.reset}`);
    return;
  }
  
  console.log(`${colors.blue}Checking syntax in ${dir}...${colors.reset}`);
  
  try {
    // Use tsc to check syntax - this won't emit any files
    execSync(`npx tsc --noEmit --jsx react ${fullPath}/**/*.{ts,tsx}`, { 
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf-8'
    });
    console.log(`${colors.green}✓ No syntax errors found in ${dir}${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}✘ Syntax errors found in ${dir}:${colors.reset}\n`);
    // Format the error output to be more readable
    const formattedError = error.stdout
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        if (line.includes('error TS')) {
          return `${colors.red}${line}${colors.reset}`;
        }
        return line;
      })
      .join('\n');
    
    console.log(formattedError);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.log(`\n${colors.red}Syntax errors were found. Please fix them before running the application.${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}✓ All files checked - no syntax errors found!${colors.reset}`);
}
