import React, { createContext, useContext, useState, useEffect } from 'react';

// Define portfolio item structure
export interface PortfolioItem {
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
}

// Define context type
interface PortfolioContextType {
  portfolio: PortfolioItem[];
  addToPortfolio: (item: PortfolioItem) => void;
  removeFromPortfolio: (symbol: string) => void;
  updatePortfolioItem: (symbol: string, updates: Partial<PortfolioItem>) => void;
}

// Create the context with default values
const PortfolioContext = createContext<PortfolioContextType>({
  portfolio: [],
  addToPortfolio: () => {},
  removeFromPortfolio: () => {},
  updatePortfolioItem: () => {},
});

// Create provider component
export const PortfolioProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Load portfolio from localStorage or use empty array
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
    const savedPortfolio = localStorage.getItem('portfolio');
    return savedPortfolio ? JSON.parse(savedPortfolio) : [
      { symbol: 'AAPL', quantity: 10, purchasePrice: 175.50, purchaseDate: '2023-01-15' },
      { symbol: 'MSFT', quantity: 5, purchasePrice: 350.75, purchaseDate: '2023-02-20' },
      { symbol: 'GOOGL', quantity: 8, purchasePrice: 138.25, purchaseDate: '2023-03-10' },
      { symbol: 'AMZN', quantity: 3, purchasePrice: 145.80, purchaseDate: '2023-04-05' },
      { symbol: 'TSLA', quantity: 15, purchasePrice: 240.30, purchaseDate: '2023-05-12' }
    ];
  });

  // Save portfolio to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // Add a new item to the portfolio
  const addToPortfolio = (item: PortfolioItem) => {
    // Check if the symbol already exists
    const existingIndex = portfolio.findIndex(p => p.symbol === item.symbol);
    
    if (existingIndex >= 0) {
      // Update existing item instead of adding a new one
      const updatedPortfolio = [...portfolio];
      const existingItem = updatedPortfolio[existingIndex];
      
      // Calculate new average purchase price based on total value
      const totalOldValue = existingItem.quantity * existingItem.purchasePrice;
      const newValue = item.quantity * item.purchasePrice;
      const totalNewQuantity = existingItem.quantity + item.quantity;
      const newAveragePrice = (totalOldValue + newValue) / totalNewQuantity;
      
      updatedPortfolio[existingIndex] = {
        ...existingItem,
        quantity: totalNewQuantity,
        purchasePrice: newAveragePrice,
        // Keep the earliest purchase date
        purchaseDate: new Date(existingItem.purchaseDate) < new Date(item.purchaseDate) 
          ? existingItem.purchaseDate 
          : item.purchaseDate
      };
      
      setPortfolio(updatedPortfolio);
    } else {
      // Add as a new item
      setPortfolio(prev => [...prev, item]);
    }
  };

  // Remove an item from the portfolio
  const removeFromPortfolio = (symbol: string) => {
    setPortfolio(prev => prev.filter(item => item.symbol !== symbol));
  };

  // Update an existing portfolio item
  const updatePortfolioItem = (symbol: string, updates: Partial<PortfolioItem>) => {
    setPortfolio(prev => 
      prev.map(item => 
        item.symbol === symbol 
          ? { ...item, ...updates } 
          : item
      )
    );
  };

  return (
    <PortfolioContext.Provider value={{ 
      portfolio, 
      addToPortfolio, 
      removeFromPortfolio,
      updatePortfolioItem
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

// Export the hook for using the portfolio context
export const usePortfolioContext = () => useContext(PortfolioContext);

export default PortfolioContext;
