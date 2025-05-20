import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { useStockContext } from '../context/StockContext';
import { generateForecast } from '../utils/forecastUtils';
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Forecasting: React.FC = () => {
  const { selectedStock, stockData } = useStockContext();
  const [forecastData, setForecastData] = useState<any>(null);
  const [indicators, setIndicators] = useState<any>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    const generateForecastData = async () => {
      if (!stockData || !stockData.candles || stockData.candles.length === 0) {
        return;
      }

      setLoading(true);
      try {
        const prices = stockData.candles.map(candle => candle.close);
        const forecast = await generateForecast(prices);
        
        const dates = stockData.candles.map(candle => {
          const date = new Date(candle.time * 1000);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        
        // Add future dates
        const lastDate = new Date(stockData.candles[stockData.candles.length - 1].time * 1000);
        const futureDates = [];
        for (let i = 1; i <= forecast.prediction.length; i++) {
          const futureDate = new Date(lastDate);
          futureDate.setDate(lastDate.getDate() + i);
          futureDates.push(`${futureDate.getMonth() + 1}/${futureDate.getDate()}`);
        }
        
        setForecastData({
          labels: [...dates, ...futureDates],
          datasets: [
            {
              label: 'Historical Price',
              data: [...prices, null, null, null, null, null],
              borderColor: 'rgba(75, 192, 192, 1)',
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 2,
            },
            {
              label: 'Forecast',
              data: [...Array(prices.length).fill(null), ...forecast.prediction],
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 2,
              borderDash: [5, 5],
              fill: {
                target: 'origin',
                above: 'rgba(255, 99, 132, 0.1)',
              },
            },
            {
              label: 'SMA',
              data: [...forecast.indicators.sma, ...Array(forecast.prediction.length).fill(null)],
              borderColor: 'rgba(54, 162, 235, 1)',
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 1,
            },
          ],
        });
        
        setIndicators(forecast.indicators);
        setConfidence(forecast.confidence);
      } catch (error) {
        console.error('Error generating forecast:', error);
      } finally {
        setLoading(false);
      }
    };
    
    generateForecastData();
  }, [stockData]);

  if (!selectedStock || !forecastData || !stockData || !stockData.candles) {
    return null;
  }

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9CA3AF',
        },
      },
      tooltip: {
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            if (context.raw === null) return '';
            return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#9CA3AF',
          callback: function(value: any) {
            return '$' + value.toFixed(2);
          },
        },
      },
    },
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.7) return 'text-emerald-500';
    if (conf >= 0.4) return 'text-amber-500';
    return 'text-red-500';
  };

  const getTrendIcon = () => {
    if (!indicators) return null;
    const lastMACD = indicators.macd.macdLine[indicators.macd.macdLine.length - 1];
    const lastSignal = indicators.macd.signalLine[indicators.macd.signalLine.length - 1];
    
    if (lastMACD > lastSignal) {
      return <TrendingUp className="h-5 w-5 text-emerald-500" />;
    }
    return <TrendingDown className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Advanced Price Forecast (5 days)</h2>
        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            <span className={getConfidenceColor(confidence)}>
              {(confidence * 100).toFixed(0)}% Confidence
            </span>
          </div>
          {getTrendIcon()}
        </div>
      </div>
      
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <>
          <div className="h-64">
            <Line data={forecastData} options={chartOptions} />
          </div>
          
          {indicators && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-750 p-3 rounded-lg">
                <h3 className="text-sm font-medium mb-2">RSI</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {indicators.rsi[indicators.rsi.length - 1].toFixed(2)}
                  </span>
                  {indicators.rsi[indicators.rsi.length - 1] > 70 && (
                    <span className="text-red-500 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Overbought
                    </span>
                  )}
                  {indicators.rsi[indicators.rsi.length - 1] < 30 && (
                    <span className="text-emerald-500 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Oversold
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-750 p-3 rounded-lg">
                <h3 className="text-sm font-medium mb-2">MACD</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {indicators.macd.macdLine[indicators.macd.macdLine.length - 1].toFixed(2)}
                  </span>
                  <span className={`flex items-center ${
                    indicators.macd.histogram[indicators.macd.histogram.length - 1] > 0
                      ? 'text-emerald-500'
                      : 'text-red-500'
                  }`}>
                    {indicators.macd.histogram[indicators.macd.histogram.length - 1] > 0
                      ? <TrendingUp className="h-4 w-4 mr-1" />
                      : <TrendingDown className="h-4 w-4 mr-1" />
                    }
                    Signal: {indicators.macd.signalLine[indicators.macd.signalLine.length - 1].toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-750 p-3 rounded-lg">
                <h3 className="text-sm font-medium mb-2">SMA (14)</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {indicators.sma[indicators.sma.length - 1].toFixed(2)}
                  </span>
                  <span className={`flex items-center ${
                    indicators.sma[indicators.sma.length - 1] > stockData.candles[stockData.candles.length - 1].close
                      ? 'text-red-500'
                      : 'text-emerald-500'
                  }`}>
                    {indicators.sma[indicators.sma.length - 1] > stockData.candles[stockData.candles.length - 1].close
                      ? <TrendingDown className="h-4 w-4 mr-1" />
                      : <TrendingUp className="h-4 w-4 mr-1" />
                    }
                    Trend
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            <p className="mb-2">
              This forecast uses an advanced LSTM neural network model combined with technical indicators:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>RSI (Relative Strength Index) for overbought/oversold conditions</li>
              <li>MACD (Moving Average Convergence Divergence) for trend strength</li>
              <li>SMA (Simple Moving Average) for trend direction</li>
            </ul>
            <p className="mt-2">
              Confidence score is calculated based on the combination of these indicators and model performance.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Forecasting;