import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchMarketNews } from '../services/stockApi';
import { formatDistanceToNow } from 'date-fns';

const NewsPanel: React.FC = () => {
  const { data: news, isLoading, error } = useQuery({
    queryKey: ['marketNews'],
    queryFn: fetchMarketNews,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-3">Market News</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex space-x-3">
              <div className="h-14 w-14 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-3">Market News</h2>
        <p className="text-red-500 text-sm">Error loading news</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-3">Market News</h2>
      
      <div className="space-y-4">
        {news?.map(item => (
          <a 
            key={item.id} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-start hover:bg-slate-50 dark:hover:bg-slate-750 -mx-2 p-2 rounded"
          >
            {item.image && (
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-14 h-14 rounded object-cover mr-3"
              />
            )}
            
            <div className="flex-1">
              <h3 className="font-medium text-sm mb-1 group-hover:text-emerald-600 line-clamp-2">
                {item.title}
              </h3>
              
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center mr-3">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                </span>
                <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {item.source}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsPanel;