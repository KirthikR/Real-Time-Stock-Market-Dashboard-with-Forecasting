import axios from 'axios';

// Define a placeholder API key 
// In a real app, this should come from environment variables
const API_KEY = 'demo'; // Alpha Vantage provides a demo key for testing

// Define types for stock data
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export interface StockData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  marketCap: number;
  pe: number;
  dividend: number;
  fiftyTwoWeekRange: string;
  candles: CandleData[];
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Placeholder function for the Alpha Vantage API call
// In a real app, you would use the actual Alpha Vantage API with your API key
export const searchStockSymbol = async (query: string): Promise<Stock | null> => {
  try {
    // For demo purposes, use mock data instead of making actual API calls
    // In a real app, uncomment this code and use your API key
    // const response = await axios.get(
    //   `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`
    // );
    
    // Simulate API call with mock data for demonstration
    const mockStocks: Record<string, Stock> = {
      'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 188.32, change: 1.27 },
      'MSFT': { symbol: 'MSFT', name: 'Microsoft Corporation', price: 417.88, change: 0.53 },
      'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 175.27, change: -0.34 },
      'AMZN': { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 182.41, change: 2.14 },
      'TSLA': { symbol: 'TSLA', name: 'Tesla, Inc.', price: 237.43, change: -1.68 },
      'META': { symbol: 'META', name: 'Meta Platforms, Inc.', price: 474.99, change: 1.05 },
      'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 950.02, change: 3.82 },
      'JPM': { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 182.07, change: -0.21 },
      'V': { symbol: 'V', name: 'Visa Inc.', price: 279.60, change: 0.37 },
      'WMT': { symbol: 'WMT', name: 'Walmart Inc.', price: 67.89, change: 0.45 },
    };
    
    const upperQuery = query.toUpperCase();
    
    if (mockStocks[upperQuery]) {
      return mockStocks[upperQuery];
    }
    
    // Find any partial matches
    const matches = Object.values(mockStocks).filter(
      stock => stock.symbol.includes(upperQuery) || stock.name.toUpperCase().includes(upperQuery)
    );
    
    if (matches.length > 0) {
      return matches[0];
    }
    
    return null;
  } catch (error) {
    console.error("Error searching for stock:", error);
    return null;
  }
};

export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    // Simulate API call with mock data
    // In a real app, this would fetch from Alpha Vantage or similar
    
    // Generate random candle data for the chart
    const candles = generateMockCandleData(symbol, 90); // 90 days of data
    const latestCandle = candles[candles.length - 1];
    
    return {
      open: latestCandle.open,
      high: latestCandle.high,
      low: latestCandle.low,
      close: latestCandle.close,
      volume: latestCandle.volume,
      marketCap: getMarketCap(symbol),
      pe: getPERatio(symbol),
      dividend: getDividendYield(symbol),
      fiftyTwoWeekRange: `$${(latestCandle.close * 0.8).toFixed(2)} - $${(latestCandle.close * 1.2).toFixed(2)}`,
      candles,
    };
  } catch (error) {
    console.error("Error fetching stock data:", error);
    throw error;
  }
};

export const fetchMarketIndices = async () => {
  // Add some randomization to simulate live data changes
  const getRandomChange = () => (Math.random() * 4 - 2).toFixed(2);
  const getRandomPrice = (base: number) => (base + (Math.random() * 10 - 5)).toFixed(2);

  return [
    { 
      symbol: 'SPY', 
      name: 'S&P 500', 
      price: parseFloat(getRandomPrice(5230.15)), 
      change: parseFloat(getRandomChange()),
      volume: Math.floor(Math.random() * 1000000) + 500000,
      marketCap: '33.2T'
    },
    { 
      symbol: 'QQQ', 
      name: 'Nasdaq', 
      price: parseFloat(getRandomPrice(17483.21)), 
      change: parseFloat(getRandomChange()),
      volume: Math.floor(Math.random() * 800000) + 400000,
      marketCap: '22.1T'
    },
    { 
      symbol: 'DIA', 
      name: 'Dow Jones', 
      price: parseFloat(getRandomPrice(38972.54)), 
      change: parseFloat(getRandomChange()),
      volume: Math.floor(Math.random() * 600000) + 300000,
      marketCap: '12.8T'
    },
    { 
      symbol: 'VGK', 
      name: 'FTSE Europe', 
      price: parseFloat(getRandomPrice(62.34)), 
      change: parseFloat(getRandomChange()),
      volume: Math.floor(Math.random() * 400000) + 200000,
      marketCap: '8.4T'
    },
    { 
      symbol: 'EWJ', 
      name: 'Nikkei 225', 
      price: parseFloat(getRandomPrice(61.88)), 
      change: parseFloat(getRandomChange()),
      volume: Math.floor(Math.random() * 300000) + 150000,
      marketCap: '6.2T'
    },
  ];
};

export const fetchMarketNews = async () => {
  // Simulate market news data
  return [
    {
      id: 1,
      title: 'Fed Signals Interest Rate Cut Amid Cooling Inflation',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: 'Financial Times',
      url: 'https://www.ft.com',
      image: 'https://images.pexels.com/photos/5849577/pexels-photo-5849577.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      id: 2,
      title: 'Tech Stocks Rally as AI Chip Demand Surges',
      date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      source: 'CNBC',
      url: 'https://www.cnbc.com',
      image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      id: 3,
      title: 'Apple Announces New Product Lineup, Shares React Positively',
      date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      source: 'Bloomberg',
      url: 'https://www.bloomberg.com',
      image: 'https://images.pexels.com/photos/4158/apple-iphone-smartphone-desk.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      id: 4,
      title: 'Oil Prices Drop as Global Demand Concerns Mount',
      date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      source: 'Reuters',
      url: 'https://www.reuters.com',
      image: 'https://images.pexels.com/photos/87236/pexels-photo-87236.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
  ];
};

// Helper functions to generate mock data
function generateMockCandleData(symbol: string, days: number) {
  const basePrice = getBasePrice(symbol);
  const volatility = getVolatility(symbol);
  const candles = [];
  
  // Start from 'days' ago
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  let currentPrice = basePrice;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Random price movement
    const change = (Math.random() * 2 - 1) * volatility * currentPrice;
    const open = currentPrice;
    const close = open + change;
    
    const high = Math.max(open, close) + Math.random() * volatility * currentPrice / 2;
    const low = Math.min(open, close) - Math.random() * volatility * currentPrice / 2;
    
    // Random volume between 1M and 20M
    const volume = Math.floor(1000000 + Math.random() * 19000000);
    
    candles.push({
      time: Math.floor(date.getTime() / 1000),
      open,
      high,
      low,
      close,
      volume,
    });
    
    currentPrice = close;
  }
  
  return candles;
}

function getBasePrice(symbol: string): number {
  const prices: Record<string, number> = {
    'AAPL': 190,
    'MSFT': 420,
    'GOOGL': 175,
    'AMZN': 180,
    'TSLA': 240,
    'META': 475,
    'NVDA': 950,
    'JPM': 180,
    'V': 280,
    'WMT': 68,
  };
  
  return prices[symbol] || 100;
}

function getVolatility(symbol: string): number {
  const volatilities: Record<string, number> = {
    'AAPL': 0.01,
    'MSFT': 0.008,
    'GOOGL': 0.012,
    'AMZN': 0.015,
    'TSLA': 0.025,
    'META': 0.018,
    'NVDA': 0.022,
    'JPM': 0.009,
    'V': 0.007,
    'WMT': 0.006,
  };
  
  return volatilities[symbol] || 0.015;
}

function getMarketCap(symbol: string): number {
  const marketCaps: Record<string, number> = {
    'AAPL': 3000000000000, // 3T
    'MSFT': 3100000000000, // 3.1T
    'GOOGL': 2200000000000, // 2.2T
    'AMZN': 1900000000000, // 1.9T
    'TSLA': 750000000000, // 750B
    'META': 1200000000000, // 1.2T
    'NVDA': 2300000000000, // 2.3T
    'JPM': 550000000000, // 550B
    'V': 600000000000, // 600B
    'WMT': 400000000000, // 400B
  };
  
  return marketCaps[symbol] || 100000000000;
}

function getPERatio(symbol: string): number {
  const ratios: Record<string, number> = {
    'AAPL': 28.5,
    'MSFT': 34.2,
    'GOOGL': 26.8,
    'AMZN': 40.3,
    'TSLA': 68.7,
    'META': 22.1,
    'NVDA': 75.3,
    'JPM': 14.2,
    'V': 32.1,
    'WMT': 24.8,
  };
  
  return ratios[symbol] || 20.0;
}

function getDividendYield(symbol: string): number {
  const yields: Record<string, number> = {
    'AAPL': 0.52,
    'MSFT': 0.74,
    'GOOGL': 0.0,
    'AMZN': 0.0,
    'TSLA': 0.0,
    'META': 0.0,
    'NVDA': 0.05,
    'JPM': 2.35,
    'V': 0.81,
    'WMT': 1.42,
  };
  
  return yields[symbol] || 0.0;
}