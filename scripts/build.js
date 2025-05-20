const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

console.log(`${colors.cyan}┌─────────────────────────────────────────────┐${colors.reset}`);
console.log(`${colors.cyan}│                                             │${colors.reset}`);
console.log(`${colors.cyan}│   Building Stock Market Dashboard for       │${colors.reset}`);
console.log(`${colors.cyan}│   production deployment                     │${colors.reset}`);
console.log(`${colors.cyan}│                                             │${colors.reset}`);
console.log(`${colors.cyan}└─────────────────────────────────────────────┘${colors.reset}`);

// Step 1: Clean the dist directory
console.log(`\n${colors.yellow}Cleaning previous build...${colors.reset}`);
try {
  execSync('rm -rf dist', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Cleaned dist directory${colors.reset}`);
} catch (error) {
  console.error(`Error cleaning dist directory: ${error.message}`);
  process.exit(1);
}

// Step 2: Type checking
console.log(`\n${colors.yellow}Running TypeScript type checking...${colors.reset}`);
try {
  execSync('tsc --noEmit', { stdio: 'inherit' });
  console.log(`${colors.green}✓ TypeScript check passed${colors.reset}`);
} catch (error) {
  console.error(`TypeScript errors found. Please fix them before building.`);
  process.exit(1);
}

// Step 3: Build the app
console.log(`\n${colors.yellow}Building the application...${colors.reset}`);
try {
  execSync('vite build', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Build completed successfully${colors.reset}`);
} catch (error) {
  console.error(`Error during build: ${error.message}`);
  process.exit(1);
}

// Step 4: Check build size
console.log(`\n${colors.yellow}Analyzing build size...${colors.reset}`);
const distDir = path.join(__dirname, '../dist');
const files = fs.readdirSync(path.join(distDir, 'assets'));

const totalSizeBytes = files.reduce((total, file) => {
  const filePath = path.join(distDir, 'assets', file);
  const stats = fs.statSync(filePath);
  return total + stats.size;
}, 0);

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

console.log(`${colors.green}✓ Total build size: ${formatBytes(totalSizeBytes)}${colors.reset}`);
console.log(`${colors.blue}  JS files:${colors.reset}`);

files
  .filter(file => file.endsWith('.js'))
  .sort((a, b) => {
    const sizeA = fs.statSync(path.join(distDir, 'assets', a)).size;
    const sizeB = fs.statSync(path.join(distDir, 'assets', b)).size;
    return sizeB - sizeA;
  })
  .forEach(file => {
    const filePath = path.join(distDir, 'assets', file);
    const fileSize = fs.statSync(filePath).size;
    console.log(`  - ${file}: ${formatBytes(fileSize)}`);
  });

console.log(`\n${colors.green}✓ Build completed and ready for deployment!${colors.reset}`);
console.log(`${colors.magenta}  You can deploy the 'dist' directory to your web server.${colors.reset}`);
