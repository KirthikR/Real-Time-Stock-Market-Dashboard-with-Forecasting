import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, RefreshCw, Filter, TrendingUp, TrendingDown, Clock, Star } from 'lucide-react';

// Interfaces
interface EarningsEvent {
  id: string;
  symbol: string;
  companyName: string;
  date: string;
  time: 'before' | 'after' | 'during';
  estimatedEPS: number;
  previousEPS: number;
  surprise?: number;
  hasReported: boolean;
  isWatched: boolean;
}

// Mock data function (simplified)
const fetchEarningsData = async (): Promise<EarningsEvent[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const today = new Date();
  const events: EarningsEvent[] = [];
  
  // Generate events for the next 14 days
  for (let i = -2; i < 14; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Add 3-5 events per day
    const eventsPerDay = Math.floor(Math.random() * 3) + 3;
    
    for (let j = 0; j < eventsPerDay; j++) {
      const symbols = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'WMT'];
      const companyNames = [
        'Apple Inc.', 'Microsoft Corp.', 'Amazon.com Inc.', 'Alphabet Inc.', 'Meta Platforms Inc.',
        'Tesla, Inc.', 'NVIDIA Corp.', 'JPMorgan Chase & Co.', 'Visa Inc.', 'Walmart Inc.'
      ];
      
      // Use a different selection method to avoid duplicates
      // Select based on both the day index and the event index
      const index = (Math.abs(i) + j) % symbols.length;
      
      const estimatedEPS = parseFloat((Math.random() * 3 + 0.1).toFixed(2));
      const previousEPS = parseFloat((estimatedEPS * (1 + (Math.random() * 0.4 - 0.2))).toFixed(2));
      
      const hasReported = i < 0;
      const surprise = hasReported 
        ? parseFloat(((Math.random() * 0.3 - 0.15) * 100).toFixed(2))
        : undefined;
      
      // Generate a truly unique ID with a random component
      events.push({
        id: `${date.toISOString().slice(0, 10)}-${symbols[index]}-${j}-${Math.random().toString(36).slice(2, 7)}`,
        symbol: symbols[index],
        companyName: companyNames[index],
        date: date.toISOString().slice(0, 10),
        time: ['before', 'after', 'during'][Math.floor(Math.random() * 3)] as 'before' | 'after' | 'during',
        estimatedEPS,
        previousEPS,
        surprise,
        hasReported,
        isWatched: Math.random() > 0.7
      });
    }
  }
  
  // Sort by date
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Component definition
function EarningsView() {
  const [earningsData, setEarningsData] = useState<EarningsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'watched' | 'upcoming' | 'reported'>('upcoming');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchEarningsData();
      setEarningsData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
    
    // Refresh once per day
    const intervalId = setInterval(fetchData, 24 * 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Filter earnings data
  const filteredData = earningsData.filter(event => {
    switch (filter) {
      case 'watched':
        return event.isWatched;
      case 'upcoming':
        return !event.hasReported;
      case 'reported':
        return event.hasReported;
      default:
        return true;
    }
  });
  
  // Group by date
  const groupedData = filteredData.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, EarningsEvent[]>);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get time badge
  const getTimeBadge = (time: 'before' | 'after' | 'during') => {
    switch (time) {
      case 'before':
        return (
          <div className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
            Before Open
          </div>
        );
      case 'after':
        return (
          <div className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
            After Close
          </div>
        );
      case 'during':
        return (
          <div className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
            During Market
          </div>
        );
    }
  };
  
  // Toggle watched status
  const toggleWatched = (id: string) => {
    setEarningsData(prev => 
      prev.map(event => 
        event.id === id 
          ? { ...event, isWatched: !event.isWatched }
          : event
      )
    );
  };

  return (
    <div className="rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-500/10">
            <Calendar className="h-6 w-6 text-indigo-500" />
          </div>
          <h2 className="text-xl font-bold">Earnings Calendar</h2>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`h-5 w-5 text-blue-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {lastUpdated && (
        <div className="text-xs text-slate-400 mb-4">
          Last updated: {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString()}
        </div>
      )}
      
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
            filter === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center space-x-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Upcoming</span>
          </div>
        </button>
        <button
          onClick={() => setFilter('reported')}
          className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
            filter === 'reported'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Reported</span>
          </div>
        </button>
        <button
          onClick={() => setFilter('watched')}
          className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
            filter === 'watched'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center space-x-1">
            <Star className="h-3.5 w-3.5" />
            <span>Watched</span>
          </div>
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center space-x-1">
            <Filter className="h-3.5 w-3.5" />
            <span>All Events</span>
          </div>
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-slate-400">Loading earnings data...</div>
        </div>
      ) : filteredData.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedData).map(([date, events], groupIndex) => (
            <div key={`${date}-${groupIndex}`} className="pb-4">
              <div className="text-lg font-bold mb-3 sticky top-0 bg-slate-900 py-2 z-10">
                {formatDate(date)}
              </div>
              <div className="space-y-3">
                {events.map((event, eventIndex) => (
                  <motion.div
                    key={`${event.id}-${eventIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-lg">{event.symbol}</span>
                          <button
                            onClick={() => toggleWatched(event.id)}
                            className={`p-1 rounded-full ${
                              event.isWatched 
                                ? 'text-yellow-400 hover:text-yellow-300' 
                                : 'text-slate-500 hover:text-slate-400'
                            }`}
                          >
                            <Star className="h-4 w-4" fill={event.isWatched ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                        <div className="text-sm text-slate-400">{event.companyName}</div>
                      </div>
                      {getTimeBadge(event.time)}
                    </div>

                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-slate-500">Est. EPS</div>
                        <div className="font-medium">${event.estimatedEPS.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Prev. EPS</div>
                        <div className="font-medium">${event.previousEPS.toFixed(2)}</div>
                      </div>
                      {event.hasReported && event.surprise !== undefined && (
                        <div>
                          <div className="text-xs text-slate-500">Surprise</div>
                          <div className={`font-medium flex items-center ${
                            event.surprise >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {event.surprise >= 0 ? (
                              <TrendingUp className="h-3.5 w-3.5 mr-1" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5 mr-1" />
                            )}
                            {event.surprise >= 0 ? '+' : ''}{event.surprise}%
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-40 text-slate-400">
          <p>No earnings events found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

// Export as both default and named export
export { EarningsView };
export default EarningsView;
