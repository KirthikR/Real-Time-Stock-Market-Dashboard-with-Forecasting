
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Preparing for deployment...');

// Ensure the public directory exists
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('Created public directory');
}

// Ensure _redirects file exists
const redirectsFile = path.join(publicDir, '_redirects');
if (!fs.existsSync(redirectsFile)) {
  fs.writeFileSync(redirectsFile, '/*    /index.html   200');
  console.log('Created _redirects file');
}

// Check for react-router-dom in package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const hasDependency = packageJson.dependencies && packageJson.dependencies['react-router-dom'];
  
  if (!hasDependency) {
    console.log('react-router-dom not found in dependencies, installing...');
    execSync('npm install react-router-dom', { stdio: 'inherit' });
    console.log('react-router-dom installed');
  } else {
    console.log('react-router-dom is already installed');
  }

  // Add deploy script if it doesn't exist
  if (!packageJson.scripts['deploy']) {
    packageJson.scripts['deploy'] = 'npm run build && netlify deploy --prod';
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
    console.log('Added deploy script to package.json');
  }
} catch (error) {
  console.error('Error checking dependencies:', error);
  process.exit(1);
}

// Run npm install to ensure all dependencies are installed
console.log('Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('Dependencies installed successfully');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}

console.log('Deployment preparation complete! ✅');
console.log('You can now run: npm run deploy');
