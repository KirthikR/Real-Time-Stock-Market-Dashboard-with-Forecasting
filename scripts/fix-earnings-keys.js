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

console.log(`${colors.magenta}=== Fixing Duplicate Keys in EarningsView Component ===${colors.reset}`);

// Path to the EarningsView component
const earningsViewPath = path.join(process.cwd(), 'src', 'components', 'EarningsView.tsx');

if (fs.existsSync(earningsViewPath)) {
  try {
    console.log(`${colors.yellow}Examining EarningsView.tsx...${colors.reset}`);
    let content = fs.readFileSync(earningsViewPath, 'utf8');
    
    // Find the part where events are mapped and rendered
    if (content.includes('id: `${date.toISOString().slice(0, 10)}-${symbols[index]}`')) {
      console.log(`${colors.yellow}Found potential duplicate key issue in event generation...${colors.reset}`);
      
      // Modify the key generation to include a random part or counter
      const fixedContent = content.replace(
        'id: `${date.toISOString().slice(0, 10)}-${symbols[index]}`',
        'id: `${date.toISOString().slice(0, 10)}-${symbols[index]}-${j}-${Math.random().toString(36).substring(2, 7)}`'
      );
      
      fs.writeFileSync(earningsViewPath, fixedContent);
      console.log(`${colors.green}✓ Fixed key generation in event creation${colors.reset}`);
    } 
    // Also look for the render part with map function
    else if (content.includes('key={event.id}')) {
      console.log(`${colors.yellow}Event IDs may be duplicated. Enhancing key uniqueness in rendering...${colors.reset}`);
      
      // Find the map function and ensure keys are unique by adding an index
      const fixedContent = content.replace(
        /{events.map\((event)\s*=>\s*\(/g,
        '{events.map((event, eventIndex) => ('
      ).replace(
        /key={event.id}/g,
        'key={`${event.id}-${eventIndex}`}'
      );
      
      fs.writeFileSync(earningsViewPath, fixedContent);
      console.log(`${colors.green}✓ Enhanced key uniqueness in event rendering${colors.reset}`);
    }
    else {
      console.log(`${colors.yellow}Could not locate specific key generation pattern.${colors.reset}`);
      console.log(`${colors.yellow}Manually adding indexes to all mapping functions...${colors.reset}`);
      
      // Modify all map functions to include indexes and use them in keys
      let fixedContent = content;
      
      // Pattern 1: Object entries mapping (for date grouping)
      fixedContent = fixedContent.replace(
        /{Object\.entries\(groupedData\)\.map\(\(\[date, events\]\)\s*=>\s*\(/g,
        '{Object.entries(groupedData).map(([date, events], groupIndex) => ('
      );
      
      // Pattern 2: Events mapping
      fixedContent = fixedContent.replace(
        /{events\.map\((event)\s*=>\s*\(/g,
        '{events.map((event, eventIndex) => ('
      );
      
      // Pattern 3: Component stack mapping
      fixedContent = fixedContent.replace(
        /{this\.state\.errorInfo\.componentStack\.split\(['"]\\n['"]\)\.map\((line, i\)\s*=>/g,
        '{this.state.errorInfo.componentStack.split("\\n").map((line, i) =>'
      );
      
      // Enhance key props
      fixedContent = fixedContent.replace(
        /key={event\.id}/g,
        'key={`${event.id}-${groupIndex}-${eventIndex}`}'
      );
      
      fixedContent = fixedContent.replace(
        /key={date}/g,
        'key={`${date}-${groupIndex}`}'
      );
      
      fs.writeFileSync(earningsViewPath, fixedContent);
      console.log(`${colors.green}✓ Enhanced key uniqueness in all mapping functions${colors.reset}`);
    }
    
    console.log(`${colors.green}✓ Completed fixes to EarningsView component${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error updating EarningsView.tsx: ${error.message}${colors.reset}`);
  }
} else {
  console.log(`${colors.red}EarningsView.tsx not found!${colors.reset}`);
}

// Create a direct fix for the mocked data generation as well
const directFix = `
// Replace this function in your EarningsView.tsx
const fetchEarningsData = async (): Promise<EarningsEvent[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const today = new Date();
  const events: EarningsEvent[] = [];
  
  // Generate events for the next 14 days
  for (let i = -2; i < 14; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Add 3-5 events per day
    const eventsPerDay = Math.floor(Math.random() * 3) + 3;
    
    for (let j = 0; j < eventsPerDay; j++) {
      const symbols = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'WMT'];
      const companyNames = [
        'Apple Inc.', 'Microsoft Corp.', 'Amazon.com Inc.', 'Alphabet Inc.', 'Meta Platforms Inc.',
        'Tesla, Inc.', 'NVIDIA Corp.', 'JPMorgan Chase & Co.', 'Visa Inc.', 'Walmart Inc.'
      ];
      
      // Use a different selection method to avoid duplicates
      // Select based on both the day index and the event index
      const index = (Math.abs(i) + j) % symbols.length;
      
      const estimatedEPS = parseFloat((Math.random() * 3 + 0.1).toFixed(2));
      const previousEPS = parseFloat((estimatedEPS * (1 + (Math.random() * 0.4 - 0.2))).toFixed(2));
      
      const hasReported = i < 0;
      const surprise = hasReported 
        ? parseFloat(((Math.random() * 0.3 - 0.15) * 100).toFixed(2))
        : undefined;
      
      // Generate a truly unique ID by including all variable parts and a random string
      events.push({
        id: \`\${date.toISOString().slice(0, 10)}-\${symbols[index]}-\${j}-\${Math.random().toString(36).slice(2, 7)}\`,
        symbol: symbols[index],
        companyName: companyNames[index],
        date: date.toISOString().slice(0, 10),
        time: ['before', 'after', 'during'][Math.floor(Math.random() * 3)] as 'before' | 'after' | 'during',
        estimatedEPS,
        previousEPS,
        surprise,
        hasReported,
        isWatched: Math.random() > 0.7
      });
    }
  }
  
  // Sort by date
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
`;

console.log(`${colors.cyan}Advice for manual fix if needed:${colors.reset}`);
console.log(directFix);

console.log(`\n${colors.green}=== Fix Complete ===${colors.reset}`);
console.log(`${colors.cyan}Try running the application again:${colors.reset}`);
console.log(`${colors.yellow}npm run dev${colors.reset}`);
