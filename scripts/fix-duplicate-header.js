#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

console.log(`${colors.magenta}=== Fixing Duplicate Header Issue ===${colors.reset}`);

// Check App.tsx for header rendering
const appPath = path.join(process.cwd(), 'src', 'App.tsx');
let appHasHeader = false;

if (fs.existsSync(appPath)) {
  try {
    console.log(`${colors.yellow}Examining App.tsx...${colors.reset}`);
    const content = fs.readFileSync(appPath, 'utf8');
    
    // Check if App.tsx includes Header component
    if (content.includes('<Header') || content.includes('import Header')) {
      appHasHeader = true;
      console.log(`${colors.yellow}Found Header component in App.tsx${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error reading App.tsx: ${error.message}${colors.reset}`);
  }
}

// Check Dashboard.tsx for header rendering
const dashboardPath = path.join(process.cwd(), 'src', 'components', 'Dashboard.tsx');
let dashboardUpdated = false;

if (fs.existsSync(dashboardPath)) {
  try {
    console.log(`${colors.yellow}Examining Dashboard.tsx...${colors.reset}`);
    const content = fs.readFileSync(dashboardPath, 'utf8');
    
    // Check if Dashboard includes Header component
    if (content.includes('<Header') && appHasHeader) {
      console.log(`${colors.yellow}Found duplicate Header in Dashboard.tsx - fixing...${colors.reset}`);
      
      // Removing Header from Dashboard if it's also in App
      let updatedContent = content.replace(/<Header\s*\/>\s*\n?/g, '');
      updatedContent = updatedContent.replace(/<Header\s*>\s*<\/Header\s*>\s*\n?/g, '');
      
      // Also remove the import
      updatedContent = updatedContent.replace(/import\s+Header\s+from\s+['"]\.\/Header['"];\s*\n?/g, '');
      updatedContent = updatedContent.replace(/import\s+{\s*Header\s*}\s+from\s+['"]\.\/Header['"];\s*\n?/g, '');
      
      fs.writeFileSync(dashboardPath, updatedContent);
      dashboardUpdated = true;
      console.log(`${colors.green}✓ Removed duplicate Header from Dashboard.tsx${colors.reset}`);
    } else if (!content.includes('<Header') && !appHasHeader) {
      console.log(`${colors.yellow}No Header found in Dashboard.tsx, but also none in App.tsx${colors.reset}`);
      console.log(`${colors.yellow}One of these files should include the Header component${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error updating Dashboard.tsx: ${error.message}${colors.reset}`);
  }
}

// Update main.tsx if neither App nor Dashboard has a header
const mainPath = path.join(process.cwd(), 'src', 'main.tsx');
if (!appHasHeader && !dashboardUpdated && fs.existsSync(mainPath)) {
  try {
    console.log(`${colors.yellow}Checking if we need to update main.tsx...${colors.reset}`);
    const content = fs.readFileSync(mainPath, 'utf8');
    
    // Check if there's a double rendering issue at the root
    if (content.includes('<App') && content.includes('<Dashboard')) {
      console.log(`${colors.yellow}Found possible nested App and Dashboard in main.tsx - fixing...${colors.reset}`);
      
      // Simplify to just render App
      const updatedContent = content
        .replace(/<Dashboard\s*\/>\s*\n?/g, '')
        .replace(/<Dashboard\s*>\s*<\/Dashboard\s*>\s*\n?/g, '');
      
      fs.writeFileSync(mainPath, updatedContent);
      console.log(`${colors.green}✓ Simplified main.tsx to avoid double rendering${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error updating main.tsx: ${error.message}${colors.reset}`);
  }
}

// As a fallback, modify Header.tsx to prevent double rendering
const headerPath = path.join(process.cwd(), 'src', 'components', 'Header.tsx');
if (fs.existsSync(headerPath)) {
  try {
    console.log(`${colors.yellow}Modifying Header.tsx to prevent double rendering...${colors.reset}`);
    let content = fs.readFileSync(headerPath, 'utf8');
    
    // Add a RenderedHeader tracking to prevent double rendering
    if (!content.includes('// Prevent double rendering')) {
      // Find the function declaration
      const functionStart = content.match(/function\s+Header\s*\(\s*\)\s*{|const\s+Header\s*=\s*\(\s*\)\s*=>\s*{/);
      
      if (functionStart) {
        const position = functionStart.index + functionStart[0].length;
        
        // Insert code to track if header has been rendered
        const trackingCode = `
  // Prevent double rendering
  const [alreadyRendered, setAlreadyRendered] = React.useState(false);
  
  React.useEffect(() => {
    if (document.querySelectorAll('header').length > 1) {
      setAlreadyRendered(true);
    }
  }, []);
  
  if (alreadyRendered) {
    return null;
  }
        `;
        
        content = 
          content.slice(0, position) + 
          trackingCode + 
          content.slice(position);
          
        // Make sure we have React imported
        if (!content.includes('import React')) {
          content = 'import React from \'react\';\n' + content;
        }
        
        fs.writeFileSync(headerPath, content);
        console.log(`${colors.green}✓ Added double rendering prevention to Header.tsx${colors.reset}`);
      } else {
        console.log(`${colors.yellow}Couldn't find Header function to modify${colors.reset}`);
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error updating Header.tsx: ${error.message}${colors.reset}`);
  }
}

console.log(`\n${colors.green}=== Fix Complete ===${colors.reset}`);
console.log(`${colors.cyan}Try running the application again:${colors.reset}`);
console.log(`${colors.yellow}npm run dev${colors.reset}`);
