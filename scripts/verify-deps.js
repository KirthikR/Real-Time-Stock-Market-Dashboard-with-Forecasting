const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the package.json dependencies
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const dependencies = new Set([
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {})
]);

// Common internal/built-in modules that don't need to be in package.json
const ignoreModules = new Set([
  'react', 'react-dom', 'path', 'fs', 'util', 'stream', 'http', 'https', 'events',
  'crypto', 'buffer', 'querystring', 'url', 'os', 'child_process', 'zlib',
  // Add any local modules or aliases your project uses
  '@components', '@utils', '@context', '@pages', '@hooks',
  './App', '../App', './index', '../index', './', '../'
]);

// Find all js, jsx, ts, tsx files in the src directory
console.log('Scanning for imported packages...');
let files = [];
try {
  const sourceDir = path.join(__dirname, '../src');
  const findCmd = process.platform === 'win32'
    ? `powershell "Get-ChildItem -Path ${sourceDir} -Recurse -Include *.js,*.jsx,*.ts,*.tsx | ForEach-Object { $_.FullName }"`
    : `find ${sourceDir} -type f \\( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \\)`;
  
  files = execSync(findCmd, { encoding: 'utf8' }).split('\n').filter(Boolean);
} catch (e) {
  console.error('Error finding source files:', e.message);
  process.exit(1);
}

// Find all imports
const importRegex = /import\s+(?:.*\s+from\s+)?['"]([^'"./][^'"]*)['"]/g;
const missingDeps = new Set();

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    // Extract the package name (first part of the path)
    const packageName = importPath.startsWith('@')
      ? importPath.split('/').slice(0, 2).join('/')
      : importPath.split('/')[0];
    
    if (!dependencies.has(packageName) && !ignoreModules.has(packageName)) {
      missingDeps.add(packageName);
    }
  }
});

// Report missing dependencies
if (missingDeps.size > 0) {
  console.error('\n⚠️ Missing dependencies detected! ⚠️');
  console.error('The following packages are imported but not listed in package.json:');
  missingDeps.forEach(dep => console.error(`- ${dep}`));
  console.error('\nPlease install them with:');
  console.error(`npm install ${[...missingDeps].join(' ')}`);
  
  // Install missing dependencies automatically
  console.log('\nAttempting to install missing dependencies automatically...');
  try {
    execSync(`npm install ${[...missingDeps].join(' ')}`, { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!');
  } catch (e) {
    console.error('❌ Failed to install dependencies:', e.message);
    process.exit(1);
  }
} else {
  console.log('✅ All imported packages are properly listed in package.json!');
}
