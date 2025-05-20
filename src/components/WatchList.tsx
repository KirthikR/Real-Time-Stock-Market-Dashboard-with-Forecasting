import React from 'react';
import { ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { useStockContext } from '../context/StockContext';

const WatchList: React.FC = () => {
  const { watchlist, selectStock, removeFromWatchlist } = useStockContext();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-3">Watchlist</h2>
      
      {watchlist.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-sm py-4">
          Add stocks to your watchlist by searching and clicking the star icon.
        </p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {watchlist.map(stock => (
            <div 
              key={stock.symbol}
              className="py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 -mx-2 px-2 rounded"
              onClick={() => selectStock(stock.symbol)}
            >
              <div>
                <p className="font-medium">{stock.symbol}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stock.name}</p>
              </div>
              
              <div className="flex items-center">
                <div 
                  className={`mr-4 text-right ${
                    stock.change >= 0 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  <p className="font-medium">${stock.price.toFixed(2)}</p>
                  <div className="flex items-center text-xs">
                    {stock.change >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(stock.change).toFixed(2)}%
                  </div>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(stock.symbol);
                  }}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchList;