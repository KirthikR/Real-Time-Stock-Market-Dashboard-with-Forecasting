import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStockData, searchStockSymbol } from '../services/stockApi';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export interface StockData {
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  marketCap?: number;
  pe?: number;
  dividend?: number;
  fiftyTwoWeekRange?: string;
  candles?: Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

interface StockContextType {
  selectedStock: Stock | null;
  stockData: StockData | null;
  watchlist: Stock[];
  searchStock: (query: string) => Promise<void>;
  selectStock: (symbol: string) => void;
  addToWatchlist: (symbol: string) => Promise<void>;
  removeFromWatchlist: (symbol: string) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [watchlist, setWatchlist] = useState<Stock[]>([
    { symbol: 'AAPL', name: 'Apple Inc.', price: 188.32, change: 1.27 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: 417.88, change: 0.53 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 175.27, change: -0.34 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 182.41, change: 2.14 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: 237.43, change: -1.68 },
  ]);

  const { data: stockData, refetch: refetchStockData } = useQuery({
    queryKey: ['stockData', selectedStock?.symbol],
    queryFn: () => selectedStock ? fetchStockData(selectedStock.symbol) : null,
    enabled: !!selectedStock,
    refetchInterval: 60000, // Refresh every minute
  });

  useEffect(() => {
    // Load watchlist from localStorage on initial render
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
    
    // Select first stock from watchlist if available
    if (watchlist.length > 0 && !selectedStock) {
      setSelectedStock(watchlist[0]);
    }
  }, []);

  useEffect(() => {
    // Save watchlist to localStorage whenever it changes
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const searchStock = async (query: string) => {
    try {
      const result = await searchStockSymbol(query);
      if (result) {
        setSelectedStock(result);
      }
    } catch (error) {
      console.error('Error searching for stock:', error);
    }
  };

  const selectStock = (symbol: string) => {
    const stock = watchlist.find(s => s.symbol === symbol);
    if (stock) {
      setSelectedStock(stock);
    }
  };

  const addToWatchlist = async (symbol: string) => {
    // Check if already in watchlist
    if (watchlist.some(s => s.symbol === symbol)) {
      return;
    }
    
    try {
      const stockInfo = await searchStockSymbol(symbol);
      if (stockInfo) {
        setWatchlist(prev => [...prev, stockInfo]);
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(s => s.symbol !== symbol));
    
    // If the removed stock was selected, select another from the watchlist
    if (selectedStock?.symbol === symbol) {
      const updatedWatchlist = watchlist.filter(s => s.symbol !== symbol);
      if (updatedWatchlist.length > 0) {
        setSelectedStock(updatedWatchlist[0]);
      } else {
        setSelectedStock(null);
      }
    }
  };

  const value = {
    selectedStock,
    stockData,
    watchlist,
    searchStock,
    selectStock,
    addToWatchlist,
    removeFromWatchlist,
  };

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
};

export const useStockContext = () => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStockContext must be used within a StockProvider');
  }
  return context;
};