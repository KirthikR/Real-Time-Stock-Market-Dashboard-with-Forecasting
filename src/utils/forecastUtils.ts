import * as tf from '@tensorflow/tfjs';
import { SMA, RSI, MACD } from 'technicalindicators';

interface ForecastResult {
  prediction: number[];
  confidence: number;
  indicators: {
    sma: number[];
    rsi: number[];
    macd: {
      macdLine: number[];
      signalLine: number[];
      histogram: number[];
    };
  };
}

// Configuration for model complexity
const MODEL_CONFIG = {
  lstmUnits: 50,
  denseUnits: 30,
  batchSize: 32,
  sequenceLength: 20,
};

// Normalize data between 0 and 1
const normalize = (data: number[]): { normalized: number[]; min: number; max: number } => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const normalized = data.map(x => (x - min) / (max - min));
  return { normalized, min, max };
};

// Denormalize data back to original scale
const denormalize = (normalized: number[], min: number, max: number): number[] => {
  return normalized.map(x => x * (max - min) + min);
};

// Create sequences for LSTM model
const createSequences = (data: number[], lookback: number): [number[][][], number[]] => {
  const X: number[][][] = [];
  const y: number[] = [];
  
  for (let i = lookback; i < data.length; i++) {
    const sequence = data.slice(i - lookback, i).map(value => [value]);
    X.push(sequence);
    y.push(data[i]);
  }
  
  return [X, y];
};

// Optimized model creation function
export const createForecastModel = (inputShape: number[], outputShape: number) => {
  const model = tf.sequential();
  
  model.add(tf.layers.lstm({
    units: MODEL_CONFIG.lstmUnits,
    inputShape: inputShape,
    kernelInitializer: 'glorotNormal',
    recurrentInitializer: 'glorotNormal',
    returnSequences: false
  }));
  
  model.add(tf.layers.dense({
    units: MODEL_CONFIG.denseUnits,
    activation: 'relu',
    kernelInitializer: 'glorotNormal'
  }));
  
  model.add(tf.layers.dense({
    units: outputShape,
    activation: 'linear'
  }));
  
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError'
  });
  
  return model;
};

// Optimize data processing with web workers
export const prepareTimeSeriesData = async (data: number[]): Promise<tf.Tensor[]> => {
  return new Promise((resolve) => {
    const processData = () => {
      const xs: number[][] = [];
      const ys: number[] = [];

      for (let i = 0; i < data.length - MODEL_CONFIG.sequenceLength; i++) {
        xs.push(data.slice(i, i + MODEL_CONFIG.sequenceLength));
        ys.push(data[i + MODEL_CONFIG.sequenceLength]);
      }

      const tensors = [
        tf.tensor2d(xs, [xs.length, MODEL_CONFIG.sequenceLength]),
        tf.tensor2d(ys, [ys.length, 1])
      ];
      
      resolve(tensors);
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => processData());
    } else {
      setTimeout(processData, 0);
    }
  });
};

// Lazy-load TensorFlow.js only when needed
export const loadTensorFlow = async (): Promise<typeof tf> => {
  if (!(window as any).tf) {
    console.log('Loading TensorFlow.js dynamically');
    await import('@tensorflow/tfjs');
  }
  return (window as any).tf;
};

// Cache forecasts to reduce computation
const forecastCache = new Map<string, any>();

export const getForecast = async (symbol: string, data: number[]): Promise<number[]> => {
  const cacheKey = `${symbol}-${data.length}-${data[data.length-1]}`;
  
  if (forecastCache.has(cacheKey)) {
    return forecastCache.get(cacheKey);
  }
  
  await loadTensorFlow();
  const model = await createForecastModel([MODEL_CONFIG.sequenceLength, 1], 1);
  const [xsTensor, ysTensor] = await prepareTimeSeriesData(data);
  
  await model.fit(xsTensor, ysTensor, {
    epochs: 50,
    batchSize: MODEL_CONFIG.batchSize,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (logs?.loss < 0.001) {
          model.stopTraining = true;
        }
      }
    }
  });
  
  const lastSequence = tf.tensor2d([data.slice(-MODEL_CONFIG.sequenceLength)], 
    [1, MODEL_CONFIG.sequenceLength]);
  const forecast = model.predict(lastSequence) as tf.Tensor;
  const forecastData = await forecast.data();
  
  xsTensor.dispose();
  ysTensor.dispose();
  lastSequence.dispose();
  forecast.dispose();
  model.dispose();
  
  const result = Array.from(forecastData);
  forecastCache.set(cacheKey, result);
  
  if (forecastCache.size > 20) {
    forecastCache.delete(forecastCache.keys().next().value);
  }
  
  return result;
};

// Calculate technical indicators
const calculateIndicators = (prices: number[]): ForecastResult['indicators'] => {
  const period = 14;
  
  const sma = SMA.calculate({
    period,
    values: prices,
  });
  
  const rsi = RSI.calculate({
    period,
    values: prices,
  });
  
  const macdResult = MACD.calculate({
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    values: prices,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  
  return {
    sma,
    rsi,
    macd: {
      macdLine: macdResult.map(x => x.MACD),
      signalLine: macdResult.map(x => x.signal),
      histogram: macdResult.map(x => x.histogram),
    },
  };
};

// Calculate forecast confidence based on indicators
const calculateConfidence = (
  rsi: number[],
  macd: { macdLine: number[]; signalLine: number[] }
): number => {
  const lastRSI = rsi[rsi.length - 1];
  const lastMACD = macd.macdLine[macd.macdLine.length - 1];
  const lastSignal = macd.signalLine[macd.signalLine.length - 1];
  
  let confidence = 0.5;
  
  if (lastRSI > 70) confidence -= 0.2;
  else if (lastRSI < 30) confidence += 0.2;
  
  if (lastMACD > lastSignal) confidence += 0.1;
  else if (lastMACD < lastSignal) confidence -= 0.1;
  
  return Math.max(0, Math.min(1, confidence));
};

export const generateForecast = async (prices: number[]): Promise<ForecastResult> => {
  if (prices.length < 50) {
    throw new Error('Insufficient data for forecasting');
  }
  
  const indicators = calculateIndicators(prices);
  
  const lookback = MODEL_CONFIG.sequenceLength;
  const { normalized, min, max } = normalize(prices);
  const [sequences, labels] = createSequences(normalized, lookback);
  
  const model = await createForecastModel([lookback, 1], 1);
  const xsTensor = tf.tensor3d(sequences);
  const ysTensor = tf.tensor2d(labels, [labels.length, 1]);
  
  await model.fit(xsTensor, ysTensor, {
    epochs: 50,
    batchSize: MODEL_CONFIG.batchSize,
    shuffle: true,
    validationSplit: 0.1,
  });
  
  const lastSequence = normalized.slice(-lookback);
  const predictionCount = 5;
  const predictions: number[] = [];
  
  let currentSequence = [...lastSequence];
  
  for (let i = 0; i < predictionCount; i++) {
    const inputSequence = currentSequence.map(value => [value]);
    const input = tf.tensor3d([inputSequence]);
    const pred = model.predict(input) as tf.Tensor;
    const predValue = pred.dataSync()[0];
    predictions.push(predValue);
    
    currentSequence.shift();
    currentSequence.push(predValue);
  }
  
  const denormalizedPredictions = denormalize(predictions, min, max);
  
  const confidence = calculateConfidence(
    indicators.rsi,
    {
      macdLine: indicators.macd.macdLine,
      signalLine: indicators.macd.signalLine,
    }
  );
  
  xsTensor.dispose();
  ysTensor.dispose();
  model.dispose();
  
  return {
    prediction: denormalizedPredictions,
    confidence,
    indicators,
  };
};