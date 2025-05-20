import React, { useState, useEffect, useRef } from 'react';
import { createChart, LineStyle, ColorType } from 'lightweight-charts';
import { useStockContext } from '../context/StockContext';
import { formatDate } from '../utils/dateUtils';

type TimeframeOption = '1D' | '1W' | '1M' | '3M' | '1Y';

const StockChart: React.FC = () => {
  const { selectedStock, stockData } = useStockContext();
  const [timeframe, setTimeframe] = useState<TimeframeOption>('1M');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // Initialize chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: '#2D3748', style: LineStyle.Dotted },
        horzLines: { color: '#2D3748', style: LineStyle.Dotted },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });
    
    // Create series
    const series = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });
    
    chartRef.current = chart;
    seriesRef.current = series;
    
    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);
  
  useEffect(() => {
    if (!seriesRef.current || !stockData || !stockData.candles) return;
    
    const candles = stockData.candles.map(candle => ({
      time: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));
    
    seriesRef.current.setData(candles);
    
    if (chartRef.current && candles.length > 0) {
      chartRef.current.timeScale().fitContent();
    }
  }, [stockData]);

  if (!selectedStock) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 h-96 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">
          Search for a stock to view the chart
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">
            {selectedStock.symbol} - {selectedStock.name}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {formatDate(new Date())}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {(['1D', '1W', '1M', '3M', '1Y'] as TimeframeOption[]).map(option => (
            <button
              key={option}
              onClick={() => setTimeframe(option)}
              className={`px-3 py-1 rounded-md text-sm ${
                timeframe === option
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      <div ref={chartContainerRef} className="h-96 w-full" />
    </div>
  );
};

export default StockChart;