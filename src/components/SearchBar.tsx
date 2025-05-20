import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Bookmark, Clock } from 'lucide-react';
import { useStockContext } from '../context/StockContext';
import { motion, AnimatePresence } from 'framer-motion';

// Interfaces
interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

interface SearchBarProps {
  onClose?: () => void;
  className?: string;
}

// Mock stocks database - in production, you would fetch this from an API
const stocksDatabase: StockSearchResult[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'Common Stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', type: 'Common Stock' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', type: 'Common Stock' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', type: 'Common Stock' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', type: 'Common Stock' },
  { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', type: 'Common Stock' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', exchange: 'NYSE', type: 'Common Stock' },
  { symbol: 'MA', name: 'Mastercard Incorporated', exchange: 'NYSE', type: 'Common Stock' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', exchange: 'NYSE', type: 'Common Stock' },
  { symbol: 'HD', name: 'Home Depot Inc.', exchange: 'NYSE', type: 'Common Stock' },
  { symbol: 'BAC', name: 'Bank of America Corp.', exchange: 'NYSE', type: 'Common Stock' },
  { symbol: 'PFE', name: 'Pfizer Inc.', exchange: 'NYSE', type: 'Common Stock' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', exchange: 'NYSE', type: 'Common Stock' },
  { symbol: 'CVX', name: 'Chevron Corporation', exchange: 'NYSE', type: 'Common Stock' },
  { symbol: 'NFLX', name: 'Netflix, Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
  { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ', type: 'Common Stock' },
  { symbol: 'DIS', name: 'Walt Disney Co.', exchange: 'NYSE', type: 'Common Stock' },
  { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE', type: 'Common Stock' },
  { symbol: 'KO', name: 'Coca-Cola Co.', exchange: 'NYSE', type: 'Common Stock' }
];

const SearchBar: React.FC<SearchBarProps> = ({ onClose, className = '' }) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [recents, setRecents] = useState<StockSearchResult[]>([]);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { setSelectedStock } = useStockContext();

  // Load recent searches from localStorage
  useEffect(() => {
    const savedRecents = localStorage.getItem('recentSearches');
    if (savedRecents) {
      try {
        setRecents(JSON.parse(savedRecents));
      } catch (e) {
        console.error('Error parsing recent searches', e);
        setRecents([]);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecent = (stock: StockSearchResult) => {
    const updatedRecents = [
      stock,
      ...recents.filter(item => item.symbol !== stock.symbol).slice(0, 4)
    ];
    setRecents(updatedRecents);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecents));
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setLoading(true);
    
    // Simulating API call delay
    setTimeout(() => {
      if (value.trim() === '') {
        setResults([]);
      } else {
        // First try exact symbol match
        const exactSymbolMatch = stocksDatabase.filter(
          stock => stock.symbol.toLowerCase() === value.toLowerCase()
        );
        
        // Then partial matches in symbol and name
        const partialMatches = stocksDatabase.filter(
          stock => 
            (stock.symbol.toLowerCase().includes(value.toLowerCase()) || 
             stock.name.toLowerCase().includes(value.toLowerCase())) &&
            !exactSymbolMatch.some(match => match.symbol === stock.symbol)
        );
        
        // Combine with exact matches first
        setResults([...exactSymbolMatch, ...partialMatches].slice(0, 7));
      }
      setLoading(false);
    }, 300);
  };

  // Handle clicking outside the search component
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(e.target as Node) && 
        inputRef.current && 
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle stock selection
  const selectStock = (stock: StockSearchResult) => {
    setSelectedStock(stock.symbol);
    saveRecent(stock);
    setQuery('');
    setResults([]);
    setIsActive(false);
    if (onClose) onClose();
  };

  // Clear search query
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleSearchChange}
          onFocus={() => setIsActive(true)}
          className="w-full p-3 pl-10 pr-12 text-sm rounded-lg bg-slate-800/70 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
          placeholder="Search for stocks (e.g., AAPL, Microsoft)"
          aria-label="Search for stocks"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isActive && (query || recents.length > 0) && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden"
          >
            {loading && (
              <div className="p-4 text-center text-slate-400">
                <div className="animate-pulse">Searching...</div>
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="p-4 text-center text-slate-400">
                No results found for "{query}"
              </div>
            )}

            {!loading && results.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-700 bg-slate-800/50">
                  <div className="flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>Search Results</span>
                  </div>
                </div>
                <ul>
                  {results.map((stock) => (
                    <li key={stock.symbol}>
                      <button
                        onClick={() => selectStock(stock)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-white">{stock.symbol}</div>
                          <div className="text-xs text-slate-400">{stock.name}</div>
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                          {stock.exchange}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!query && recents.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-700 bg-slate-800/50">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Recent Searches</span>
                  </div>
                </div>
                <ul>
                  {recents.map((stock) => (
                    <li key={stock.symbol}>
                      <button
                        onClick={() => selectStock(stock)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-white">{stock.symbol}</div>
                          <div className="text-xs text-slate-400">{stock.name}</div>
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                          {stock.exchange}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-2 border-t border-slate-700 bg-slate-800/80">
              <button
                onClick={() => setIsActive(false)}
                className="w-full px-3 py-2 text-xs text-center text-slate-400 hover:text-slate-200 transition-colors"
              >
                Press Esc to close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
