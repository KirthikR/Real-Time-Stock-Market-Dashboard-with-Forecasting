import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, RefreshCw, Filter, TrendingUp, TrendingDown, Clock, Star, ChevronRight, ChevronLeft, X, BarChart2, Newspaper, DollarSign, Users } from 'lucide-react';

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

// Mock data - in production, replace with real API calls
const fetchEarningsData = async (): Promise<EarningsEvent[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const today = new Date();
  const events: EarningsEvent[] = [];
  
  for (let i = -2; i < 14; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const eventsPerDay = Math.floor(Math.random() * 3) + 3;
    
    for (let j = 0; j < eventsPerDay; j++) {
      const symbols = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'WMT', 'DIS', 'NKE', 'NFLX', 'INTC', 'AMD'];
      const companyNames = [
        'Apple Inc.', 'Microsoft Corp.', 'Amazon.com Inc.', 'Alphabet Inc.', 'Meta Platforms Inc.',
        'Tesla, Inc.', 'NVIDIA Corp.', 'JPMorgan Chase & Co.', 'Visa Inc.', 'Walmart Inc.',
        'Walt Disney Co.', 'Nike, Inc.', 'Netflix, Inc.', 'Intel Corp.', 'Advanced Micro Devices, Inc.'
      ];
      
      const index = Math.floor(Math.random() * symbols.length);
      const estimatedEPS = parseFloat((Math.random() * 3 + 0.1).toFixed(2));
      const previousEPS = parseFloat((estimatedEPS * (1 + (Math.random() * 0.4 - 0.2))).toFixed(2));
      
      const hasReported = i < 0;
      const surprise = hasReported 
        ? parseFloat(((Math.random() * 0.3 - 0.15) * 100).toFixed(2))
        : undefined;
      
      events.push({
        id: `${date.toISOString().slice(0, 10)}-${symbols[index]}`,
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
  
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Component definition
const EarningsCalendar: React.FC = () => {
  const [earningsData, setEarningsData] = useState<EarningsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'watched' | 'upcoming' | 'reported'>('upcoming');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

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

  const toggleEventDetails = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 24 * 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

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

  const groupedData = filteredData.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, EarningsEvent[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

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

  const toggleWatched = (id: string) => {
    setEarningsData(prev => 
      prev.map(event => 
        event.id === id 
          ? { ...event, isWatched: !event.isWatched }
          : event
      )
    );
  };

  const scrollContainer = (containerId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollLeft += scrollAmount;
    }
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
      
      <div className="relative mb-6">
        <div className="flex overflow-x-auto no-scrollbar" 
             id="filter-buttons-container"
             style={{ 
               msOverflowStyle: 'none',
               scrollbarWidth: 'none',
             }}>
          <style jsx>{`
            #filter-buttons-container::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          <div className="flex space-x-3 p-2">
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
        </div>
        
        <button
          onClick={() => scrollContainer('filter-buttons-container', 'left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800/80 rounded-full p-1 shadow-lg hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-slate-300" />
        </button>
        
        <button
          onClick={() => scrollContainer('filter-buttons-container', 'right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800/80 rounded-full p-1 shadow-lg hover:bg-slate-700 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-slate-400">Loading earnings data...</div>
        </div>
      ) : filteredData.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedData).map(([date, events]) => (
            <div key={date} className="pb-4">
              <div className="text-lg font-bold mb-3 sticky top-0 bg-slate-900 py-2 z-10">
                {formatDate(date)}
              </div>
              <div className="space-y-3">
                {events.map((event) => (
                  <motion.div
                    key={event.id}
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

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => toggleEventDetails(event.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1
                          ${expandedEventId === event.id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                      >
                        <span>{expandedEventId === event.id ? 'Hide Details' : 'View Details'}</span>
                        {expandedEventId === event.id ? <X className="h-3.5 w-3.5 ml-1" /> : <ChevronRight className="h-3.5 w-3.5 ml-1" />}
                      </button>
                    </div>

                    {expandedEventId === event.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-slate-700 relative"
                      >
                        <div className="relative">
                          <button 
                            onClick={() => scrollContainer(`details-container-${event.id}`, 'left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800/90 rounded-full p-1.5 shadow-lg hover:bg-slate-700"
                          >
                            <ChevronLeft className="h-4 w-4 text-slate-200" />
                          </button>
                          
                          <div 
                            id={`details-container-${event.id}`}
                            className="flex space-x-4 overflow-x-auto py-2 px-8 no-scrollbar"
                            style={{ 
                              msOverflowStyle: 'none',
                              scrollbarWidth: 'none',
                            }}
                          >
                            <style jsx>{`
                              #details-container-${event.id}::-webkit-scrollbar {
                                display: none;
                              }
                            `}</style>
                            
                            <div className="min-w-[260px] bg-slate-800 rounded-xl p-4 flex-shrink-0 border border-slate-700">
                              <div className="flex items-center space-x-2 mb-3"></div>
                                <BarChart2 className="h-4 w-4 text-blue-400" />
                                <h4 className="font-medium text-blue-400">Historical Performance</h4>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Q1 2023</span>
                                  <span className="text-xs font-medium">${(event.previousEPS * 0.9).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Q2 2023</span>
                                  <span className="text-xs font-medium">${(event.previousEPS * 0.95).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Q3 2023</span>
                                  <span className="text-xs font-medium">${event.previousEPS.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Q4 2023 (Est.)</span>
                                  <span className="text-xs font-medium">${event.estimatedEPS.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="min-w-[260px] bg-slate-800 rounded-xl p-4 flex-shrink-0 border border-slate-700">
                              <div className="flex items-center space-x-2 mb-3">
                                <Users className="h-4 w-4 text-green-400" />
                                <h4 className="font-medium text-green-400">Analyst Recommendations</h4>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Buy</span>
                                  <span className="text-xs font-medium text-green-400">{Math.floor(Math.random() * 15 + 5)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Hold</span>
                                  <span className="text-xs font-medium text-yellow-400">{Math.floor(Math.random() * 10 + 2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Sell</span>
                                  <span className="text-xs font-medium text-red-400">{Math.floor(Math.random() * 5)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Consensus</span>
                                  <span className="text-xs font-medium">Outperform</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="min-w-[260px] bg-slate-800 rounded-xl p-4 flex-shrink-0 border border-slate-700">
                              <div className="flex items-center space-x-2 mb-3">
                                <Newspaper className="h-4 w-4 text-purple-400" />
                                <h4 className="font-medium text-purple-400">Latest News</h4>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <h5 className="text-xs font-medium">Q4 Earnings Preview</h5>
                                  <p className="text-xs text-slate-400 mt-1">Analysts expect strong performance in cloud segment...</p>
                                </div>
                                <div>
                                  <h5 className="text-xs font-medium">New Product Launch</h5>
                                  <p className="text-xs text-slate-400 mt-1">Company announced new products at annual event...</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="min-w-[260px] bg-slate-800 rounded-xl p-4 flex-shrink-0 border border-slate-700">
                              <div className="flex items-center space-x-2 mb-3">
                                <DollarSign className="h-4 w-4 text-amber-400" />
                                <h4 className="font-medium text-amber-400">Financial Metrics</h4>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Market Cap</span>
                                  <span className="text-xs font-medium">${(Math.random() * 500 + 100).toFixed(2)}B</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Revenue (TTM)</span>
                                  <span className="text-xs font-medium">${(Math.random() * 100 + 10).toFixed(2)}B</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">P/E Ratio</span>
                                  <span className="text-xs font-medium">{(Math.random() * 30 + 5).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">52W Range</span>
                                  <span className="text-xs font-medium">${(Math.random() * 100 + 50).toFixed(2)} - ${(Math.random() * 200 + 150).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => scrollContainer(`details-container-${event.id}`, 'right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800/90 rounded-full p-1.5 shadow-lg hover:bg-slate-700"
                          >
                            <ChevronRight className="h-4 w-4 text-slate-200" />
                          </button>
                        </div>
                      </motion.div>
                    )}
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
};

export default EarningsCalendar;
