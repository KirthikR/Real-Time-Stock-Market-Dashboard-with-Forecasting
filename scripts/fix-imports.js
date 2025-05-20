#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.yellow}=== Fixing Import Statements ===${colors.reset}`);

// Fix App.tsx imports
const appTsxPath = path.join(process.cwd(), 'src', 'App.tsx');
if (fs.existsSync(appTsxPath)) {
  try {
    console.log(`${colors.yellow}Examining App.tsx...${colors.reset}`);
    let content = fs.readFileSync(appTsxPath, 'utf8');
    
    // Replace named import with default import
    const fixedContent = content.replace(
      /import\s*{\s*ErrorBoundary\s*}\s*from\s*['"]\.\/components\/ErrorBoundary['"];?/,
      `import ErrorBoundary from './components/ErrorBoundary';`
    );
    
    if (content !== fixedContent) {
      fs.writeFileSync(appTsxPath, fixedContent);
      console.log(`${colors.green}✓ Fixed ErrorBoundary import in App.tsx${colors.reset}`);
    } else {
      console.log(`${colors.yellow}No changes needed to App.tsx${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error updating App.tsx: ${error.message}${colors.reset}`);
  }
}

// Just to be safe, also check main.tsx
const mainTsxPath = path.join(process.cwd(), 'src', 'main.tsx');
if (fs.existsSync(mainTsxPath)) {
  try {
    console.log(`${colors.yellow}Examining main.tsx...${colors.reset}`);
    let content = fs.readFileSync(mainTsxPath, 'utf8');
    
    // Replace named import with default import if it exists
    const fixedContent = content.replace(
      /import\s*{\s*ErrorBoundary\s*}\s*from\s*['"]\.\/components\/ErrorBoundary['"];?/,
      `import ErrorBoundary from './components/ErrorBoundary';`
    );
    
    if (content !== fixedContent) {
      fs.writeFileSync(mainTsxPath, fixedContent);
      console.log(`${colors.green}✓ Fixed ErrorBoundary import in main.tsx${colors.reset}`);
    } else {
      console.log(`${colors.yellow}No changes needed to main.tsx${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error updating main.tsx: ${error.message}${colors.reset}`);
  }
}

// Create a proper ErrorBoundary if it doesn't exist
const errorBoundaryPath = path.join(process.cwd(), 'src', 'components', 'ErrorBoundary.tsx');
if (fs.existsSync(errorBoundaryPath)) {
  try {
    console.log(`${colors.yellow}Examining ErrorBoundary.tsx...${colors.reset}`);
    let content = fs.readFileSync(errorBoundaryPath, 'utf8');
    
    // Check if we need to add a named export
    if (!content.includes('export class ErrorBoundary') && content.includes('class ErrorBoundary')) {
      // Fix by adding a named export
      content = content.replace(
        'class ErrorBoundary',
        'export class ErrorBoundary'
      );
      
      fs.writeFileSync(errorBoundaryPath, content);
      console.log(`${colors.green}✓ Added named export to ErrorBoundary.tsx${colors.reset}`);
    } else if (!content.includes('export class ErrorBoundary') && !content.includes('class ErrorBoundary')) {
      // Create a fresh error boundary with both named and default exports
      console.log(`${colors.yellow}Creating new ErrorBoundary.tsx with proper exports...${colors.reset}`);
      
      const simpleBoundary = `import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
`;
      
      fs.writeFileSync(errorBoundaryPath, simpleBoundary);
      console.log(`${colors.green}✓ Created new ErrorBoundary.tsx with both named and default exports${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error updating ErrorBoundary.tsx: ${error.message}${colors.reset}`);
  }
}

console.log(`\n${colors.green}=== Import Fixes Complete ===${colors.reset}`);
console.log(`${colors.cyan}Try running the application again:${colors.reset}`);
console.log(`${colors.yellow}npm run dev${colors.reset}`);
