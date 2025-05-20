import React from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, BarChart2, 
  Activity, Clock, Award, Users
} from 'lucide-react';
import { useStockContext } from '../context/StockContext';

const StockDetails: React.FC = () => {
  const { selectedStock, stockData } = useStockContext();

  if (!selectedStock || !stockData) return null;

  const metrics = [
    { name: 'Open', value: `$${stockData.open?.toFixed(2) ?? '-'}`, icon: <Clock className="w-4 h-4" /> },
    { name: 'High', value: `$${stockData.high?.toFixed(2) ?? '-'}`, icon: <TrendingUp className="w-4 h-4" /> },
    { name: 'Low', value: `$${stockData.low?.toFixed(2) ?? '-'}`, icon: <TrendingDown className="w-4 h-4" /> },
    { name: 'Volume', value: stockData.volume ? (stockData.volume > 1000000 ? `${(stockData.volume / 1000000).toFixed(2)}M` : `${(stockData.volume / 1000).toFixed(0)}K`) : '-', icon: <BarChart2 className="w-4 h-4" /> },
    { name: 'Market Cap', value: stockData.marketCap ? `$${(stockData.marketCap / 1000000000).toFixed(2)}B` : '-', icon: <DollarSign className="w-4 h-4" /> },
    { name: 'P/E Ratio', value: stockData.pe?.toFixed(2) ?? '-', icon: <Activity className="w-4 h-4" /> },
    { name: 'Dividend', value: stockData.dividend ? `${stockData.dividend.toFixed(2)}%` : '-', icon: <Award className="w-4 h-4" /> },
    { name: '52W Range', value: stockData.fiftyTwoWeekRange ?? '-', icon: <Users className="w-4 h-4" /> }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-3">Stock Details</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="flex items-start p-3 bg-slate-50 dark:bg-slate-750 rounded-md">
            <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full mr-3">
              {metric.icon}
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{metric.name}</p>
              <p className="font-semibold">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockDetails;