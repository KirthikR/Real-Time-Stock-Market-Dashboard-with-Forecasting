import React, { useState } from 'react';
import { Search, Star, Moon, Sun } from 'lucide-react';
import { useStockContext } from '../context/StockContext';

const Header: React.FC = () => {
  const { searchStock, addToWatchlist } = useStockContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchStock(searchTerm);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mr-6">
              StockVision
            </h1>
            
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search stocks (e.g., AAPL, MSFT)"
                className="w-64 lg:w-80 pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <button 
                type="button"
                onClick={() => addToWatchlist(searchTerm)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-amber-500"
              >
                <Star className="h-4 w-4" />
              </button>
            </form>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-500" />
              )}
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="mt-3 md:hidden relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stocks (e.g., AAPL, MSFT)"
            className="w-full pl-10 pr-10 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <button 
            type="button"
            onClick={() => addToWatchlist(searchTerm)}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-amber-500"
          >
            <Star className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
};

export default Header;