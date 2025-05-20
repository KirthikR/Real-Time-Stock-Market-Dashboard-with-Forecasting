import React, { useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown, DollarSign, RefreshCw, PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { usePortfolioContext } from '../context/PortfolioContext';
import { motion } from 'framer-motion';

interface StockPriceData {
  symbol: string;
  currentPrice: number;
  previousClose: number;
  changePercent: number;
}

// Mock function to get current prices - replace with actual API in production
const fetchCurrentPrices = async (symbols: string[]): Promise<Record<string, StockPriceData>> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Create random but realistic price data
  return symbols.reduce((acc, symbol) => {
    const basePrice = parseFloat((Math.random() * 300 + 20).toFixed(2));
    const changePercent = parseFloat((Math.random() * 6 - 3).toFixed(2));
    const previousClose = parseFloat((basePrice / (1 + changePercent / 100)).toFixed(2));
    
    acc[symbol] = {
      symbol,
      currentPrice: basePrice,
      previousClose,
      changePercent
    };
    return acc;
  }, {} as Record<string, StockPriceData>);
};

const ProfitLossTracker: React.FC = () => {
  const { portfolio } = usePortfolioContext();
  const [priceData, setPriceData] = useState<Record<string, StockPriceData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'summary'>('table');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({ key: 'symbol', direction: 'ascending' });

  // Extract unique symbols from portfolio
  const symbols = useMemo(() => 
    [...new Set(portfolio.map(item => item.symbol))],
    [portfolio]
  );

  // Fetch current prices
  const fetchPrices = async () => {
    if (symbols.length === 0) return;
    
    setIsLoading(true);
    try {
      const data = await fetchCurrentPrices(symbols);
      setPriceData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching price data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    
    // Set up interval for real-time updates
    const intervalId = setInterval(fetchPrices, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, [symbols]);

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    if (Object.keys(priceData).length === 0) return { 
      totalValue: 0, 
      totalCost: 0, 
      totalDayChange: 0, 
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      dayChangePercent: 0,
      positions: []
    };

    let totalValue = 0;
    let totalCost = 0;
    let totalDayChange = 0;

    const positions = portfolio.map(position => {
      const data = priceData[position.symbol];
      if (!data) return null;

      const quantity = position.quantity;
      const currentValue = data.currentPrice * quantity;
      const cost = position.purchasePrice * quantity;
      const gainLoss = currentValue - cost;
      const gainLossPercent = (gainLoss / cost) * 100;
      
      const previousValue = data.previousClose * quantity;
      const dayChange = currentValue - previousValue;
      
      totalValue += currentValue;
      totalCost += cost;
      totalDayChange += dayChange;

      return {
        ...position,
        currentPrice: data.currentPrice,
        currentValue,
        cost,
        gainLoss,
        gainLossPercent,
        dayChange,
        dayChangePercent: (dayChange / previousValue) * 100
      };
    }).filter(Boolean) as any[];

    // Sort positions based on sortConfig
    const sortedPositions = [...positions];
    sortedPositions.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    return {
      totalValue,
      totalCost,
      totalGainLoss: totalValue - totalCost,
      totalGainLossPercent: ((totalValue - totalCost) / totalCost) * 100,
      totalDayChange,
      dayChangePercent: totalValue > 0 ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0,
      positions: sortedPositions
    };
  }, [portfolio, priceData, sortConfig]);

  // Request sort
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format percent
  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Get style for positive/negative numbers
  const getValueStyle = (value: number) => {
    return value >= 0 
      ? 'text-green-500' 
      : 'text-red-500';
  };

  // Get icon for positive/negative numbers
  const getValueIcon = (value: number) => {
    return value >= 0 
      ? <ChevronUp className="h-4 w-4 text-green-500" /> 
      : <ChevronDown className="h-4 w-4 text-red-500" />;
  };

  if (portfolio.length === 0) {
    return (
      <div className="rounded-2xl p-6 shadow-xl text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <DollarSign className="h-6 w-6 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold">Profit & Loss Tracker</h2>
        </div>
        <p className="text-slate-400 my-10">
          No positions in your portfolio. Add stocks to track profit and loss.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <DollarSign className="h-6 w-6 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold">Profit & Loss Tracker</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'summary' : 'table')}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            {viewMode === 'table' ? (
              <PieChart className="h-5 w-5 text-slate-400" />
            ) : (
              <TrendingUp className="h-5 w-5 text-slate-400" />
            )}
          </button>
          <button
            onClick={fetchPrices}
            className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`h-5 w-5 text-blue-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {lastUpdated && (
        <div className="text-xs text-slate-400 mb-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/50">
            <div className="text-sm text-slate-400 mb-1">Portfolio Value</div>
            <div className="text-xl font-bold">
              {formatCurrency(portfolioMetrics.totalValue)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50">
            <div className="text-sm text-slate-400 mb-1">Today's Change</div>
            <div className={`text-xl font-bold flex items-center ${getValueStyle(portfolioMetrics.totalDayChange)}`}>
              {getValueIcon(portfolioMetrics.totalDayChange)}
              <span>{formatCurrency(portfolioMetrics.totalDayChange)}</span>
              <span className="text-sm ml-1">
                ({formatPercent(portfolioMetrics.dayChangePercent)})
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50">
            <div className="text-sm text-slate-400 mb-1">Total Gain/Loss</div>
            <div className={`text-xl font-bold flex items-center ${getValueStyle(portfolioMetrics.totalGainLoss)}`}>
              {getValueIcon(portfolioMetrics.totalGainLoss)}
              <span>{formatCurrency(portfolioMetrics.totalGainLoss)}</span>
              <span className="text-sm ml-1">
                ({formatPercent(portfolioMetrics.totalGainLossPercent)})
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50">
            <div className="text-sm text-slate-400 mb-1">Total Cost</div>
            <div className="text-xl font-bold">
              {formatCurrency(portfolioMetrics.totalCost)}
            </div>
          </div>
        </div>
      </div>

      {isLoading && portfolioMetrics.positions.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse text-slate-400">Loading portfolio data...</div>
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="text-xs uppercase bg-slate-800/50">
              <tr>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-slate-700/30"
                  onClick={() => requestSort('symbol')}
                >
                  Symbol
                </th>
                <th 
                  className="px-4 py-3 text-right cursor-pointer hover:bg-slate-700/30"
                  onClick={() => requestSort('currentPrice')}
                >
                  Price
                </th>
                <th 
                  className="px-4 py-3 text-right cursor-pointer hover:bg-slate-700/30"
                  onClick={() => requestSort('quantity')}
                >
                  Quantity
                </th>
                <th 
                  className="px-4 py-3 text-right cursor-pointer hover:bg-slate-700/30"
                  onClick={() => requestSort('currentValue')}
                >
                  Value
                </th>
                <th 
                  className="px-4 py-3 text-right cursor-pointer hover:bg-slate-700/30"
                  onClick={() => requestSort('dayChange')}
                >
                  Day Change
                </th>
                <th 
                  className="px-4 py-3 text-right cursor-pointer hover:bg-slate-700/30"
                  onClick={() => requestSort('gainLoss')}
                >
                  Total P/L
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {portfolioMetrics.positions.map((position) => (
                <tr key={position.symbol} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-medium">{position.symbol}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(position.currentPrice)}</td>
                  <td className="px-4 py-3 text-right">{position.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(position.currentValue)}</td>
                  <td className={`px-4 py-3 text-right ${getValueStyle(position.dayChange)}`}>
                    <div className="flex items-center justify-end">
                      {getValueIcon(position.dayChange)}
                      <span>{formatCurrency(position.dayChange)}</span>
                    </div>
                    <div className="text-xs">
                      {formatPercent(position.dayChangePercent)}
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-right ${getValueStyle(position.gainLoss)}`}>
                    <div className="flex items-center justify-end">
                      {getValueIcon(position.gainLoss)}
                      <span>{formatCurrency(position.gainLoss)}</span>
                    </div>
                    <div className="text-xs">
                      {formatPercent(position.gainLossPercent)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {portfolioMetrics.positions.map((position) => (
            <motion.div
              key={position.symbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="font-bold text-lg">{position.symbol}</div>
                <div className="flex items-center px-2 py-1 rounded-full bg-slate-700">
                  <span className="text-xs">{position.quantity} shares</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <div className="text-xs text-slate-400">Current Price</div>
                  <div>{formatCurrency(position.currentPrice)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Market Value</div>
                  <div>{formatCurrency(position.currentValue)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-slate-400">Today's P/L</div>
                  <div className={`flex items-center ${getValueStyle(position.dayChange)}`}>
                    {getValueIcon(position.dayChange)}
                    <span>{formatCurrency(position.dayChange)}</span>
                  </div>
                  <div className={`text-xs ${getValueStyle(position.dayChange)}`}>
                    {formatPercent(position.dayChangePercent)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Total P/L</div>
                  <div className={`flex items-center ${getValueStyle(position.gainLoss)}`}>
                    {getValueIcon(position.gainLoss)}
                    <span>{formatCurrency(position.gainLoss)}</span>
                  </div>
                  <div className={`text-xs ${getValueStyle(position.gainLoss)}`}>
                    {formatPercent(position.gainLossPercent)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfitLossTracker;
