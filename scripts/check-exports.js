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

console.log(`${colors.magenta}=== Checking Component Exports ===${colors.reset}`);

// Define paths to check
const componentsDir = path.join(process.cwd(), 'src/components');
const files = fs.readdirSync(componentsDir).filter(file => 
  file.endsWith('.tsx') || file.endsWith('.jsx')
);

console.log(`${colors.yellow}Found ${files.length} component files${colors.reset}`);

// Check each file for default exports
let missingDefaultExports = [];

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Simple check for default export (not foolproof but catches most cases)
  if (!content.includes('export default') && !content.match(/export\s+\{\s*\w+\s+as\s+default\s*\}/)) {
    missingDefaultExports.push(file);
    console.log(`${colors.red}✘ ${file} - Missing default export${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ ${file} - Has default export${colors.reset}`);
  }
});

// Fix missing default exports if needed
if (missingDefaultExports.length > 0) {
  console.log(`\n${colors.yellow}Found ${missingDefaultExports.length} files with missing default exports${colors.reset}`);
  
  const shouldFix = process.argv.includes('--fix');
  
  if (shouldFix) {
    console.log(`${colors.yellow}Attempting to fix missing default exports...${colors.reset}`);
    
    missingDefaultExports.forEach(file => {
      const filePath = path.join(componentsDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      const componentName = path.basename(file, path.extname(file));
      
      // Check if there's a named export with the same name as the file
      const namedExportRegex = new RegExp(`export\\s+(const|function|class)\\s+${componentName}`);
      
      if (namedExportRegex.test(content)) {
        // Add default export at the end
        content += `\n\nexport default ${componentName};\n`;
        fs.writeFileSync(filePath, content);
        console.log(`${colors.green}✓ Fixed ${file} by adding default export${colors.reset}`);
      } else {
        console.log(`${colors.red}✘ Could not automatically fix ${file} - manual fix required${colors.reset}`);
      }
    });
  } else {
    console.log(`${colors.cyan}Run with --fix to automatically fix missing default exports${colors.reset}`);
    console.log(`${colors.cyan}Example: node scripts/check-exports.js --fix${colors.reset}`);
  }
}

console.log(`\n${colors.green}=== Export Check Complete ===${colors.reset}`);
