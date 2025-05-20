import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchMarketIndices } from '../services/stockApi';
import { motion, AnimatePresence } from 'framer-motion';

const MarketOverview: React.FC = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { data: indices, isLoading, error } = useQuery({
    queryKey: ['marketIndices'],
    queryFn: fetchMarketIndices,
    refetchInterval: 10000, // Refresh every 10 seconds for more frequent updates
  });

  useEffect(() => {
    if (indices) {
      setLastUpdate(new Date());
    }
  }, [indices]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex justify-between items-center p-3 glass-effect rounded-lg">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200/20 rounded w-24"></div>
                <div className="h-3 bg-slate-200/20 rounded w-16"></div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 bg-slate-200/20 rounded w-20"></div>
                <div className="h-3 bg-slate-200/20 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <Activity className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-500 text-sm">Error loading market data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center">
          <Activity className="h-3 w-3 mr-1" />
          <span>Live Market Data</span>
        </div>
        <div className="flex items-center">
          <div className="animate-pulse">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1"></span>
          </div>
          <span>Updated {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {indices?.map(index => (
            <motion.div
              key={index.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-effect rounded-lg p-3 transition-all hover:bg-white/5"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium flex items-center">
                    {index.name}
                    {Math.abs(index.change) > 1 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                          index.change > 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {index.change > 1 ? 'Bullish' : 'Bearish'}
                      </motion.span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">{index.symbol}</p>
                </div>
                
                <div className={`text-right ${
                  index.change >= 0 
                    ? 'text-emerald-400' 
                    : 'text-red-400'
                }`}>
                  <motion.p 
                    className="font-medium"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {index.price.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                    })}
                  </motion.p>
                  <div className="flex items-center justify-end text-xs">
                    {index.change >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {Math.abs(index.change).toFixed(2)}%
                    </motion.span>
                  </div>
                </div>
              </div>
              
              <motion.div 
                className="mt-2 h-1 rounded-full bg-slate-700"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5 }}
              >
                <div 
                  className={`h-full rounded-full ${
                    index.change >= 0 ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(Math.abs(index.change) * 10, 100)}%` }}
                ></div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MarketOverview;