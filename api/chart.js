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

// Candlestick SVG Chart Generator
function generateSVG(symbol, values, periodLabel) {
  const width = 800; // slightly wider for better candlestick visibility
  const height = 400;
  const padding = { top: 120, right: 30, bottom: 20, left: 20 };
  
  const minLow = Math.min(...values.map(v => v.low));
  const maxHigh = Math.max(...values.map(v => v.high));
  const range = maxHigh - minLow || 1;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const candleSpace = chartWidth / values.length;
  const candleWidth = Math.max(1, candleSpace * 0.7);

  const mapY = (val) => padding.top + chartHeight - ((val - minLow) / range) * chartHeight;

  const firstClose = values[0].close;
  const lastClose = values[values.length - 1].close;
  const changePct = (((lastClose - firstClose) / firstClose) * 100).toFixed(2);
  const isPositive = changePct >= 0;
  const overallColor = isPositive ? '#4caf50' : '#f44336';
  
  let candlesHtml = '';

  values.forEach((v, i) => {
    const xCenter = padding.left + (i + 0.5) * candleSpace;
    const openY = mapY(v.open);
    const closeY = mapY(v.close);
    const highY = mapY(v.high);
    const lowY = mapY(v.low);

    const isBullish = v.close >= v.open;
    const color = isBullish ? '#4caf50' : '#f44336';
    const topBodyY = Math.min(openY, closeY);
    const bodyHeight = Math.max(1, Math.abs(closeY - openY));

    // Wick
    candlesHtml += `<line x1="${xCenter}" y1="${highY}" x2="${xCenter}" y2="${lowY}" stroke="${color}" stroke-width="1.5" />`;
    // Body
    candlesHtml += `<rect x="${xCenter - candleWidth/2}" y="${topBodyY}" width="${candleWidth}" height="${bodyHeight}" fill="${color}" stroke="${color}" stroke-width="1" rx="1" />`;
  });
  
  const volumeToday = values[values.length - 1].volume;
  const totalVolume = values.reduce((sum, v) => sum + v.volume, 0);
  const avgVolume = (totalVolume / values.length).toFixed(0);

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Transparent background - no rect drawn -->
      
      <!-- Chart Candles -->
      ${candlesHtml}
      
      <!-- Text Overlay -->
      <g fill="#c9d1d9" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
        <!-- Symbol & Price -->
        <text x="20" y="40" font-size="28" font-weight="800">${symbol.toUpperCase()}  $${lastClose.toFixed(2)}</text>
        
        <!-- Change % -->
        <text x="20" y="75" font-size="18" fill="${overallColor}" font-weight="600">${periodLabel} change: ${isPositive ? '+' : ''}${changePct}%</text>
        
        <!-- Volume -->
        <text x="20" y="100" font-size="14" fill="#8b949e" font-weight="500">Vol: ${formatVolume(volumeToday)} | Avg: ${formatVolume(avgVolume)}</text>
      </g>
    </svg>
  `;
}

export default async function handler(req, res) {
  const { symbol = 'KSPI', period = '30d' } = req.query;
  
  let numDays = 30;
  let periodLabel = period;
  
  const match = period.match(/^(\d+)([dmy])$/i);
  if (match) {
    const val = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    if (unit === 'd') numDays = val;
    if (unit === 'm') numDays = val * 30;
    if (unit === 'y') numDays = val * 365;
    periodLabel = `${val}${unit.toUpperCase()}`;
  } else {
    // fallback if unparseable
    numDays = parseInt(period, 10) || 30;
    periodLabel = `${numDays}D`;
  }
  
  const cacheKey = `${symbol.toUpperCase()}_${numDays}d`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { 
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    return res.send(cached.svg);
  }

  let values = [];
  let isError = false;

  try {
    if (!API_KEY) throw new Error("Missing Twelve Data API Key");
    
    const twelveDataUrl = `${BASE_URL}/time_series?symbol=${symbol}&interval=1day&outputsize=${numDays + 10}&apikey=${API_KEY}`;
    const tdResponse = await fetch(twelveDataUrl);
    const tdData = await tdResponse.json();

    if (tdData.status === 'ok' && tdData.values && tdData.values.length > 0) {
      values = tdData.values.slice(0, numDays).reverse().map(v => ({
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseInt(v.volume, 10) || 0
      }));
    } else {
      throw new Error(tdData.message || "Twelve Data returned invalid format or error");
    }
  } catch (error) {
    console.warn(`Twelve Data failed for ${symbol}: ${error.message}. Falling back to Yahoo Finance.`);
    
    try {
      const yfSymbol = getYahooSymbol(symbol);
      const period1 = new Date();
      period1.setDate(period1.getDate() - (numDays + 15)); // add buffer for weekends
      
      const queryOptions = { period1: period1, period2: new Date(), interval: '1d' };
      const yfData = await yahooFinance.chart(yfSymbol, queryOptions);
      
      if (!yfData || !yfData.quotes || yfData.quotes.length === 0) {
        throw new Error("Yahoo Finance returned no data");
      }
      
      const recentYfData = yfData.quotes.slice(-numDays);
      values = recentYfData.map(v => ({
        open: v.open,
        high: v.high,
        low: v.low,
        close: v.close,
        volume: v.volume || 0
      })).filter(v => v.close !== null && v.open !== null); 
    } catch (yfError) {
      console.error(`Yahoo Finance fallback also failed for ${symbol}: ${yfError.message}`);
      isError = true;
    }
  }

  if (isError || values.length === 0) {
    const errorSvg = `
      <svg width="600" height="300" viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg">
        <text x="300" y="150" font-family="Inter, sans-serif" font-size="20" fill="#f44336" text-anchor="middle">Error fetching data for ${symbol.toUpperCase()}</text>
      </svg>
    `;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-store');
    res.status(400).send(errorSvg);
    return;
  }

  const svgContent = generateSVG(symbol, values, periodLabel);

  cache.set(cacheKey, { svg: svgContent, timestamp: Date.now() });

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.send(svgContent);
}
