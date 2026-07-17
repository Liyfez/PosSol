import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
import { getYahooSymbol } from './symbolMap.js';

const API_KEY = process.env.TWELVE_DATA_KEY;
const BASE_URL = 'https://api.twelvedata.com';

const cache = new Map();

function formatVolume(vol) {
  if (vol >= 1000000000) return (vol / 1000000000).toFixed(1) + 'B';
  if (vol >= 1000000) return (vol / 1000000).toFixed(1) + 'M';
  if (vol >= 1000) return (vol / 1000).toFixed(1) + 'k';
  return vol.toString();
}

function generateSVG(symbol, values, numDays, dataSource) {
  const width = 600;
  const height = 300;
  const padding = { top: 120, right: 20, bottom: 20, left: 20 };
  
  const closes = values.map(v => v.close);
  const minClose = Math.min(...closes);
  const maxClose = Math.max(...closes);
  const range = maxClose - minClose || 1;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = values.map((v, i) => {
    const x = padding.left + (i / (values.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((v.close - minClose) / range) * chartHeight;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  const firstClose = values[0].close;
  const lastClose = values[values.length - 1].close;
  const changePct = (((lastClose - firstClose) / firstClose) * 100).toFixed(2);
  const isPositive = changePct >= 0;
  const lineColor = isPositive ? '#4caf50' : '#f44336';
  
  const volumeToday = values[values.length - 1].volume;
  const totalVolume = values.reduce((sum, v) => sum + v.volume, 0);
  const avgVolume = (totalVolume / values.length).toFixed(0);

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#0d1117" rx="8" />
      
      <!-- Line Chart -->
      <path d="${pathD}" fill="none" stroke="${lineColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      
      <!-- Text Overlay -->
      <g fill="#c9d1d9" font-family="Courier New, monospace">
        <!-- Symbol & Price -->
        <text x="20" y="40" font-size="24" font-weight="bold">${symbol.toUpperCase()}  $${lastClose.toFixed(2)}</text>
        
        <!-- Change % -->
        <text x="20" y="70" font-size="16" fill="${lineColor}">${numDays}d change: ${isPositive ? '+' : ''}${changePct}%</text>
        
        <!-- Volume -->
        <text x="20" y="95" font-size="14" fill="#8b949e">Vol: ${formatVolume(volumeToday)} | Avg Vol: ${formatVolume(avgVolume)}</text>
      </g>
      
      <!-- Data Source -->
      <text x="${width - 100}" y="${height - 10}" font-family="sans-serif" font-size="10" fill="#8b949e">src: ${dataSource}</text>
    </svg>
  `;
}

export default async function handler(req, res) {
  const { symbol = 'KSPI', days = 7 } = req.query;
  const numDays = parseInt(days, 10) || 7;
  
  const cacheKey = `${symbol.toUpperCase()}_${numDays}d`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { 
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    return res.send(cached.svg);
  }

  let values = [];
  let isError = false;
  let dataSource = 'TwelveData';

  try {
    if (!API_KEY) throw new Error("Missing Twelve Data API Key");
    
    const twelveDataUrl = `${BASE_URL}/time_series?symbol=${symbol}&interval=1day&outputsize=${numDays + 5}&apikey=${API_KEY}`;
    const tdResponse = await fetch(twelveDataUrl);
    const tdData = await tdResponse.json();

    if (tdData.status === 'ok' && tdData.values && tdData.values.length > 0) {
      values = tdData.values.slice(0, numDays).reverse().map(v => ({
        close: parseFloat(v.close),
        volume: parseInt(v.volume, 10) || 0
      }));
    } else {
      throw new Error(tdData.message || "Twelve Data returned invalid format or error");
    }
  } catch (error) {
    console.warn(`Twelve Data failed for ${symbol}: ${error.message}. Falling back to Yahoo Finance.`);
    dataSource = 'YahooFinance';
    
    try {
      const yfSymbol = getYahooSymbol(symbol);
      const period1 = new Date();
      period1.setDate(period1.getDate() - (numDays + 10));
      
      const queryOptions = { period1: period1, period2: new Date(), interval: '1d' };
      const yfData = await yahooFinance.chart(yfSymbol, queryOptions);
      
      if (!yfData || !yfData.quotes || yfData.quotes.length === 0) {
        throw new Error("Yahoo Finance returned no data");
      }
      
      const recentYfData = yfData.quotes.slice(-numDays);
      values = recentYfData.map(v => ({
        close: v.close,
        volume: v.volume || 0
      })).filter(v => v.close !== null && v.close !== undefined); // remove null days
    } catch (yfError) {
      console.error(`Yahoo Finance fallback also failed for ${symbol}: ${yfError.message}`);
      isError = true;
    }
  }

  if (isError || values.length === 0) {
    const errorSvg = `
      <svg width="600" height="300" viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="300" fill="#0d1117" rx="8" />
        <text x="300" y="150" font-family="Courier New, monospace" font-size="20" fill="#f44336" text-anchor="middle">Error fetching data for ${symbol}</text>
      </svg>
    `;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-store');
    res.status(400).send(errorSvg);
    return;
  }

  const svgContent = generateSVG(symbol, values, numDays, dataSource);

  cache.set(cacheKey, { svg: svgContent, timestamp: Date.now() });

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.send(svgContent);
}
