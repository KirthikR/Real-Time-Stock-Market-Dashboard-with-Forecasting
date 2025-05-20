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

console.log(`${colors.magenta}=== Fixing Invalid Selector in Header Component ===${colors.reset}`);

// Path to the Header component
const headerPath = path.join(process.cwd(), 'src', 'components', 'Header.tsx');

if (fs.existsSync(headerPath)) {
  try {
    console.log(`${colors.yellow}Reading Header.tsx...${colors.reset}`);
    let content = fs.readFileSync(headerPath, 'utf8');
    
    // Check if the file contains the invalid selector
    if (content.includes('*:contains("StockVision")')) {
      console.log(`${colors.yellow}Found invalid selector in Header.tsx...${colors.reset}`);
      
      // Replace the invalid approach with a proper one
      const improvedCode = `
  // Prevent duplicate headers
  const [alreadyRendered, setAlreadyRendered] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    // Check for multiple header elements in a proper way
    const checkForDuplicateHeaders = () => {
      const headers = document.querySelectorAll('header');
      // If we find more than one header and ours is not the first one, don't render
      if (headers.length > 1 && headerRef.current) {
        // Check if our header isn't the first one
        if (headers[0] !== headerRef.current) {
          setAlreadyRendered(true);
        }
      }
    };
    
    // Use a small delay to let the DOM update
    const timeoutId = setTimeout(checkForDuplicateHeaders, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);`;
      
      // Find and replace the problematic code section
      const problematicCode = content.match(/\/\/ Prevent duplicate headers[\s\S]*?\}, \[\]\);/);
      
      if (problematicCode) {
        content = content.replace(problematicCode[0], improvedCode);
        
        // Also add the ref to the header element
        content = content.replace(
          /<header /,
          '<header ref={headerRef} '
        );
        
        // Make sure useRef is imported
        if (!content.includes('useRef')) {
          content = content.replace(
            /import React, {([^}]*)}/,
            'import React, {$1, useRef}'
          );
        }
        
        fs.writeFileSync(headerPath, content);
        console.log(`${colors.green}✓ Fixed invalid selector in Header.tsx${colors.reset}`);
      } else {
        console.log(`${colors.red}Couldn't find the problematic code section to replace${colors.reset}`);
      }
    } else {
      console.log(`${colors.yellow}No invalid selector found in Header.tsx${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error updating Header.tsx: ${error.message}${colors.reset}`);
  }
} else {
  console.error(`${colors.red}Header.tsx not found!${colors.reset}`);
}

console.log(`\n${colors.green}=== Fix Complete ===${colors.reset}`);
console.log(`${colors.cyan}Try running the application again:${colors.reset}`);
console.log(`${colors.yellow}npm run dev${colors.reset}`);
