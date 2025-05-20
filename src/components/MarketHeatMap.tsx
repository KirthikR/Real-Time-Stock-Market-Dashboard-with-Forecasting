import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid, RefreshCw, Info } from 'lucide-react';

interface SectorData {
  name: string;
  changePercent: number;
  marketCap: number;
  stocks: {
    symbol: string;
    name: string;
    changePercent: number;
    price: number;
    marketCap: number;
  }[];
}

// Mock data function
const fetchSectorData = async (): Promise<SectorData[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      name: 'Technology',
      changePercent: 1.2,
      marketCap: 12500000000000,
      stocks: [
        { symbol: 'AAPL', name: 'Apple Inc.', changePercent: 1.7, price: 185.92, marketCap: 2940000000000 },
        { symbol: 'MSFT', name: 'Microsoft', changePercent: 0.8, price: 376.04, marketCap: 2790000000000 },
        { symbol: 'NVDA', name: 'NVIDIA', changePercent: 3.2, price: 874.15, marketCap: 2150000000000 },
        { symbol: 'GOOGL', name: 'Alphabet', changePercent: -0.5, price: 142.32, marketCap: 1780000000000 }
      ]
    },
    {
      name: 'Finance',
      changePercent: -0.5,
      marketCap: 8700000000000,
      stocks: [
        { symbol: 'JPM', name: 'JPMorgan Chase', changePercent: -0.2, price: 180.50, marketCap: 519000000000 },
        { symbol: 'BAC', name: 'Bank of America', changePercent: -0.8, price: 36.45, marketCap: 286000000000 },
        { symbol: 'WFC', name: 'Wells Fargo', changePercent: -1.1, price: 57.12, marketCap: 205000000000 },
        { symbol: 'GS', name: 'Goldman Sachs', changePercent: 0.3, price: 452.76, marketCap: 147000000000 }
      ]
    },
    {
      name: 'Healthcare',
      changePercent: 0.7,
      marketCap: 6900000000000,
      stocks: [
        { symbol: 'JNJ', name: 'Johnson & Johnson', changePercent: 0.4, price: 147.25, marketCap: 354000000000 },
        { symbol: 'UNH', name: 'UnitedHealth', changePercent: 1.5, price: 530.75, marketCap: 490000000000 },
        { symbol: 'PFE', name: 'Pfizer', changePercent: -0.2, price: 28.06, marketCap: 159000000000 },
        { symbol: 'ABBV', name: 'AbbVie', changePercent: 1.1, price: 176.48, marketCap: 312000000000 }
      ]
    },
    {
      name: 'Consumer Cyclical',
      changePercent: 0.2,
      marketCap: 5800000000000,
      stocks: [
        { symbol: 'AMZN', name: 'Amazon', changePercent: 0.6, price: 168.59, marketCap: 1760000000000 },
        { symbol: 'TSLA', name: 'Tesla', changePercent: -1.8, price: 254.62, marketCap: 812000000000 },
        { symbol: 'HD', name: 'Home Depot', changePercent: 1.0, price: 360.97, marketCap: 358000000000 },
        { symbol: 'NKE', name: 'Nike', changePercent: 0.9, price: 90.17, marketCap: 136000000000 }
      ]
    },
    {
      name: 'Energy',
      changePercent: -1.4,
      marketCap: 3900000000000,
      stocks: [
        { symbol: 'XOM', name: 'Exxon Mobil', changePercent: -1.6, price: 113.79, marketCap: 450000000000 },
        { symbol: 'CVX', name: 'Chevron', changePercent: -2.1, price: 153.32, marketCap: 285000000000 },
        { symbol: 'COP', name: 'ConocoPhillips', changePercent: -0.7, price: 117.52, marketCap: 138000000000 },
        { symbol: 'SLB', name: 'Schlumberger', changePercent: -1.2, price: 45.92, marketCap: 65000000000 }
      ]
    }
  ];
};

const MarketHeatMap: React.FC = () => {
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchSectorData();
      setSectorData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching sector data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const getColorByChange = (change: number) => {
    if (change > 3) return 'bg-green-600';
    if (change > 1.5) return 'bg-green-500';
    if (change > 0) return 'bg-green-400';
    if (change > -1.5) return 'bg-red-400';
    if (change > -3) return 'bg-red-500';
    return 'bg-red-600';
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000000) {
      return `$${(marketCap / 1000000000000).toFixed(1)}T`;
    }
    if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(1)}B`;
    }
    return `$${(marketCap / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Grid className="h-6 w-6 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold">Market Heat Map</h2>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`h-5 w-5 text-blue-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="text-xs text-slate-400 mb-4 flex justify-between items-center">
        <div>Last updated: {lastUpdated.toLocaleString()}</div>
        <div className="flex items-center">
          <Info className="h-4 w-4 mr-1" />
          <span>Size represents market cap</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-slate-400">Loading market data...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            {sectorData.map((sector) => (
              <motion.div
                key={sector.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedSector(selectedSector === sector.name ? null : sector.name)}
                className={`${getColorByChange(sector.changePercent)} cursor-pointer rounded-lg p-4 text-white transition-all ${
                  selectedSector === sector.name ? 'ring-2 ring-white' : ''
                }`}
                style={{
                  height: '120px',
                  position: 'relative',
                  opacity: 0.7 + Math.min(Math.abs(sector.changePercent) / 5, 0.3)
                }}
              >
                <div className="font-bold text-lg mb-1">{sector.name}</div>
                <div className="text-2xl font-bold">
                  {sector.changePercent > 0 ? '+' : ''}
                  {sector.changePercent.toFixed(1)}%
                </div>
                <div className="absolute bottom-3 right-3 text-xs opacity-80">
                  {formatMarketCap(sector.marketCap)}
                </div>
              </motion.div>
            ))}
          </div>

          {selectedSector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 rounded-xl bg-slate-800/50"
            >
              <h3 className="text-lg font-bold mb-3">{selectedSector} Stocks</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {sectorData
                  .find((sector) => sector.name === selectedSector)
                  ?.stocks.map((stock) => (
                    <motion.div
                      key={stock.symbol}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`${getColorByChange(
                        stock.changePercent
                      )} rounded-lg p-3 text-white`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-bold">{stock.symbol}</div>
                        <div className="text-xs opacity-80">
                          {formatMarketCap(stock.marketCap)}
                        </div>
                      </div>
                      <div className="text-xs mb-2 opacity-80">{stock.name}</div>
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold">${stock.price.toFixed(2)}</div>
                        <div
                          className={`text-sm ${
                            stock.changePercent >= 0 ? 'text-green-200' : 'text-red-200'
                          }`}
                        >
                          {stock.changePercent > 0 ? '+' : ''}
                          {stock.changePercent.toFixed(1)}%
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

// Add the default export that was missing
export default MarketHeatMap;
