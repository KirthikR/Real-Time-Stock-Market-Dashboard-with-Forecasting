import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, TrendingDown, RefreshCw, ExternalLink } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevance: number; // 0-1 score
  ticker: string;
}

// This would be replaced with actual API calls
const mockFetchNews = async (symbol: string): Promise<NewsItem[]> => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data
  return [
    {
      id: '1',
      title: `${symbol} Reports Stronger Than Expected Earnings`,
      source: 'Financial Times',
      url: 'https://example.com/news/1',
      publishedAt: new Date().toISOString(),
      sentiment: 'positive',
      relevance: 0.95,
      ticker: symbol
    },
    {
      id: '2',
      title: `Analysts Divided on ${symbol}'s Future Growth`,
      source: 'Market Watch',
      url: 'https://example.com/news/2',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      sentiment: 'neutral',
      relevance: 0.82,
      ticker: symbol
    },
    {
      id: '3',
      title: `${symbol} Faces Regulatory Challenges in European Markets`,
      source: 'Bloomberg',
      url: 'https://example.com/news/3',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      sentiment: 'negative',
      relevance: 0.88,
      ticker: symbol
    }
  ];
};

interface NewsSentimentProps {
  symbols: string[];
}

const NewsSentiment: React.FC<NewsSentimentProps> = ({ symbols = ['AAPL', 'MSFT', 'GOOGL'] }) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSymbol, setActiveSymbol] = useState<string>(symbols[0] || 'AAPL');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchNews = async () => {
    setLoading(true);
    try {
      const news = await mockFetchNews(activeSymbol);
      setNewsItems(news);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Set up interval to refresh every 5 minutes
    const intervalId = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [activeSymbol]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Newspaper className="h-6 w-6 text-purple-500" />
          </div>
          <h2 className="text-xl font-bold">News Sentiment</h2>
        </div>
        <button
          onClick={fetchNews}
          className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`h-5 w-5 text-blue-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {symbols.map((symbol) => (
            <button
              key={symbol}
              onClick={() => setActiveSymbol(symbol)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSymbol === symbol
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-400 mb-4">
        Last updated: {lastUpdated.toLocaleString()}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse text-slate-400">Loading news...</div>
        </div>
      ) : newsItems.length > 0 ? (
        <div className="space-y-4">
          {newsItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  {getSentimentIcon(item.sentiment)}
                  <span className="text-sm font-medium text-slate-300">{item.source}</span>
                  <span className="text-xs text-slate-400">{formatTime(item.publishedAt)}</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-slate-700 text-xs px-2 py-1 rounded-full text-slate-300">
                    {item.ticker}
                  </span>
                </div>
              </div>
              <h3 className="font-medium mb-2">{item.title}</h3>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      item.sentiment === 'positive'
                        ? 'bg-green-500/10 text-green-500'
                        : item.sentiment === 'negative'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-gray-500/10 text-gray-500'
                    }`}
                  >
                    {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                  </div>
                  <div className="text-xs text-slate-400">
                    Relevance: {Math.round(item.relevance * 100)}%
                  </div>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  <span className="text-xs">Read</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-slate-400">
          <p>No news available for {activeSymbol}.</p>
        </div>
      )}
    </div>
  );
};

export default NewsSentiment;
