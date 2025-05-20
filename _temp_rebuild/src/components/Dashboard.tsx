import React, { useState, useCallback, memo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import WatchList from './WatchList';
import MarketOverview from './MarketOverview';
import NewsPanel from './NewsPanel';
import { useStockContext } from '../context/StockContext';
import { useTheme } from '../context/ThemeContext';
import { Globe2, TrendingUp, Activity, Layers, Moon, Sun, DollarSign, Calendar } from 'lucide-react';
import CookieConsent from './CookieConsent';
import AlertSystem from './AlertSystem';
import NewsSentiment from './NewsSentiment';
import MarketHeatMap from './MarketHeatMap';
import ProfitLossTracker from './ProfitLossTracker';
// Import the new component directly
import EarningsView from './EarningsView';

// Lazy load components that aren't needed immediately
const StockChart = lazy(() => import('./StockChart'));
const StockDetails = lazy(() => import('./StockDetails'));
const Forecasting = lazy(() => import('./Forecasting'));
const Portfolio = lazy(() => import('./Portfolio'));

// Create memoized version of the EarningsView component
const MemoizedEarningsView = memo(EarningsView);

// Loading placeholder
const LoadingFallback = () => (
  <div className="glass-card rounded-2xl p-6 shadow-xl min-h-[200px] flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-8 w-8 rounded-full bg-slate-700/50 mb-4"></div>
      <div className="h-4 w-24 bg-slate-700/50 rounded"></div>
    </div>
  </div>
);

// Memoized components for performance
const MemoizedStockChart = memo(() => (
  <Suspense fallback={<LoadingFallback />}>
    <StockChart />
  </Suspense>
));

const MemoizedWatchList = memo(WatchList);
const MemoizedMarketOverview = memo(MarketOverview);
const MemoizedNewsPanel = memo(NewsPanel);
const MemoizedProfitLossTracker = memo(ProfitLossTracker);

// Simplified type
interface SimplifiedDropResult {
  source: { droppableId: string; index: number };
  destination?: { droppableId: string; index: number };
}

const Dashboard: React.FC = () => {
  const { selectedStock } = useStockContext();
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<'standard' | 'detailed' | 'custom'>('standard');
  
  // Custom layout state
  const [leftPanels, setLeftPanels] = useState<string[]>([
    'market-activity', 
    'stock-details', 
    'forecasting',
    'profit-loss-tracker',
    'market-heatmap'
  ]);
  
  const [rightPanels, setRightPanels] = useState<string[]>([
    'global-markets', 
    'watchlist', 
    'news',
    'portfolio',
    'alerts',
    'news-sentiment',
    'earnings-calendar'
  ]);

  const trackedSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

  const onDragEnd = useCallback((result: SimplifiedDropResult) => {
    const { source, destination } = result;
    
    if (!destination) return;
    
    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      const items = source.droppableId === 'left-column' 
        ? [...leftPanels] 
        : [...rightPanels];
      
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      
      if (source.droppableId === 'left-column') {
        setLeftPanels(items);
      } else {
        setRightPanels(items);
      }
    } else {
      // Moving between columns
      const sourceItems = source.droppableId === 'left-column'
        ? [...leftPanels]
        : [...rightPanels];
      
      const destItems = destination.droppableId === 'left-column'
        ? [...leftPanels]
        : [...rightPanels];
      
      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);
      
      if (source.droppableId === 'left-column') {
        setLeftPanels(sourceItems);
        setRightPanels(destItems);
      } else {
        setLeftPanels(destItems);
        setRightPanels(sourceItems);
      }
    }
  }, [leftPanels, rightPanels]);

  // Create panel components with useMemo to prevent unnecessary re-rendering
  const allPanels = React.useMemo(() => ({
    'market-activity': (
      <div className="glass-card rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Activity className="h-6 w-6 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold">Market Activity</h2>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-emerald-500">●</span>
            <span>Live</span>
          </div>
        </div>
        <MemoizedStockChart />
      </div>
    ),
    'stock-details': selectedStock ? (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <StockDetails />
        </Suspense>
      </motion.div>
    ) : null,
    'forecasting': selectedStock ? (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Forecasting />
        </Suspense>
      </motion.div>
    ) : null,
    'global-markets': (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Globe2 className="h-6 w-6 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold">Global Markets</h2>
        </div>
        <MemoizedMarketOverview />
      </motion.div>
    ),
    'watchlist': (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <TrendingUp className="h-6 w-6 text-purple-500" />
          </div>
          <h2 className="text-xl font-bold">Watchlist</h2>
        </div>
        <MemoizedWatchList />
      </motion.div>
    ),
    'news': (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6 shadow-xl h-[500px] overflow-hidden"
      >
        <MemoizedNewsPanel />
      </motion.div>
    ),
    'portfolio': (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl shadow-xl"
      >
        <Suspense fallback={<LoadingFallback />}>
          <Portfolio />
        </Suspense>
      </motion.div>
    ),
    'alerts': (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl shadow-xl"
      >
        <Suspense fallback={<LoadingFallback />}>
          <AlertSystem />
        </Suspense>
      </motion.div>
    ),
    'market-heatmap': (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl shadow-xl"
      >
        <MarketHeatMap />
      </motion.div>
    ),
    'news-sentiment': (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card rounded-2xl shadow-xl"
      >
        <NewsSentiment symbols={trackedSymbols} />
      </motion.div>
    ),
    'profit-loss-tracker': (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl shadow-xl"
      >
        <MemoizedProfitLossTracker />
      </motion.div>
    ),
    'earnings-calendar': (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl shadow-xl"
      >
        <MemoizedEarningsView />
      </motion.div>
    )
  }), [selectedStock, trackedSymbols]);

  // Optimized panel rendering with memo
  const renderPanels = useCallback((columnPanels: string[]) => {
    return columnPanels
      .filter(id => allPanels[id] !== null)
      .map(id => (
        <div key={id} className="mb-6">
          {allPanels[id]}
        </div>
      ));
  }, [allPanels]);

  // Optimized draggable panel rendering
  const renderDraggablePanels = useCallback((columnPanels: string[]) => {
    return (
      <div className="space-y-6">
        {columnPanels
          .filter(id => allPanels[id] !== null)
          .map(id => (
            <div key={id} className="relative">
              <div className="absolute top-3 right-3 p-1 rounded-md bg-slate-700/50 hover:bg-slate-700 cursor-move z-10">
                <Layers className="h-4 w-4 text-slate-400" />
              </div>
              {allPanels[id]}
            </div>
          ))}
      </div>
    );
  }, [allPanels]);

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' 
      ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white' 
      : 'bg-gradient-to-br from-slate-100 to-white text-slate-900'}`}
    >
      <Header />
      
      <div className="px-4 lg:px-6 py-4 bg-opacity-50 border-b border-slate-700/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex bg-slate-800/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('standard')}
                className={`px-4 py-2 text-sm ${
                  view === 'standard' 
                    ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500 text-white' 
                    : ''
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setView('detailed')}
                className={`px-4 py-2 text-sm ${
                  view === 'detailed' 
                    ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500 text-white' 
                    : ''
                }`}
              >
                Detailed
              </button>
              <button
                onClick={() => setView('custom')}
                className={`px-4 py-2 text-sm ${
                  view === 'custom' 
                    ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500 text-white' 
                    : ''
                }`}
              >
                Custom
              </button>
            </div>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        {view === 'custom' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              {renderDraggablePanels(leftPanels)}
            </div>
            <div>
              {renderDraggablePanels(rightPanels)}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">
              {renderPanels(leftPanels.slice(0, view === 'detailed' ? undefined : 3))}
            </div>
            <div className="space-y-6">
              {renderPanels(rightPanels.slice(0, view === 'detailed' ? undefined : 3))}
            </div>
          </motion.div>
        )}
      </div>
      
      <footer className="glass-effect border-t border-white/5 p-4 text-center text-sm text-slate-400">
        <p>Market data delayed by 15 minutes. For informational purposes only.</p>
      </footer>

      {/* Add the cookie consent component */}
      <CookieConsent />
    </div>
  );
};

export default Dashboard;