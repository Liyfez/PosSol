import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
import { getYahooSymbol } from './symbolMap.js';

const API_KEY = process.env.TWELVE_DATA_KEY;
const BASE_URL = 'https://api.twelvedata.com';

const cache = new Map();

function formatVolume(vol) {
  if (vol >= 1000000000) return (vol / 1000000000).toFixed(2) + 'B';
  if (vol >= 1000000) return (vol / 1000000).toFixed(2) + 'M';
  if (vol >= 1000) return (vol / 1000).toFixed(2) + 'K';
  return vol.toString();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr; // fallback
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

// Advanced Candlestick SVG Chart Generator
function generateSVG(symbol, values, metaData, periodLabel, themeName) {
  const width = 850;
  const height = 450;
  
  const themes = {
    dark: { bull: '#089981', bear: '#f23645', grid: '#2a2e39', text: '#d1d4dc', textMuted: '#787b86' },
    light: { bull: '#089981', bear: '#f23645', grid: '#e0e3eb', text: '#131722', textMuted: '#787b86' },
    monochrome: { bull: '#ffffff', bear: '#555555', grid: '#333333', text: '#ffffff', textMuted: '#a3a3a3' },
    gray: { bull: '#aaaaaa', bear: '#444444', grid: '#2a2e39', text: '#cccccc', textMuted: '#777777' },
    blue: { bull: '#00d2ff', bear: '#0055ff', grid: '#0f3460', text: '#eefbfb', textMuted: '#4da8da' },
    cyberpunk: { bull: '#00ff9f', bear: '#ff003c', grid: '#241b2f', text: '#f2e8cf', textMuted: '#7a6c96' }
  };
  
  const colors = themes[themeName] || themes.dark;

  // Padding
  const pad = { top: 60, right: 70, bottom: 30, left: 20 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const minLow = Math.min(...values.map(v => v.low));
  const maxHigh = Math.max(...values.map(v => v.high));
  // Add a 5% margin to top and bottom
  const yMargin = (maxHigh - minLow) * 0.05;
  const chartMinY = minLow - yMargin;
  const chartMaxY = maxHigh + yMargin;
  const range = chartMaxY - chartMinY || 1;

  const candleSpace = chartW / values.length;
  // Make candles use 80% of the available space, max 15px wide
  const candleWidth = Math.min(15, Math.max(1, candleSpace * 0.8));

  const mapY = (val) => pad.top + chartH - ((val - chartMinY) / range) * chartH;
  const mapX = (idx) => pad.left + (idx + 0.5) * candleSpace;

  const lastV = values[values.length - 1];
  const firstV = values[0];
  const changeVal = lastV.close - firstV.close;
  const changePct = ((changeVal / firstV.close) * 100).toFixed(2);
  const isPositive = changeVal >= 0;
  const sign = isPositive ? '+' : '';

  let gridHtml = '';
  // Y-axis grid lines & labels (Price)
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const val = chartMinY + (i / yTicks) * range;
    const y = mapY(val);
    gridHtml += `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="${colors.grid}" stroke-width="1" stroke-dasharray="2,2"/>`;
    gridHtml += `<text x="${width - pad.right + 8}" y="${y + 4}" fill="${colors.textMuted}" font-size="11" class="num">${val.toFixed(2)}</text>`;
  }

  // X-axis grid lines & labels (Time)
  const xTicks = 4;
  for (let i = 0; i <= xTicks; i++) {
    const idx = Math.floor((i / xTicks) * (values.length - 1));
    if (idx >= 0 && idx < values.length) {
      const x = mapX(idx);
      const v = values[idx];
      gridHtml += `<line x1="${x}" y1="${pad.top}" x2="${x}" y2="${height - pad.bottom}" stroke="${colors.grid}" stroke-width="1" stroke-dasharray="2,2"/>`;
      gridHtml += `<text x="${x}" y="${height - pad.bottom + 18}" fill="${colors.textMuted}" font-size="11" text-anchor="middle" class="num">${formatDate(v.date)}</text>`;
    }
  }

  let candlesHtml = '';
  values.forEach((v, i) => {
    const xCenter = mapX(i);
    const openY = mapY(v.open);
    const closeY = mapY(v.close);
    const highY = mapY(v.high);
    const lowY = mapY(v.low);

    const isBull = v.close >= v.open;
    const color = isBull ? colors.bull : colors.bear;
    
    // Y-coordinates for the body rectangle
    const topBodyY = Math.min(openY, closeY);
    // Ensure at least 1px height for the body so flat dojis are visible
    const bodyHeight = Math.max(1, Math.abs(closeY - openY));

    // Wick
    candlesHtml += `<line x1="${xCenter}" y1="${highY}" x2="${xCenter}" y2="${lowY}" stroke="${color}" stroke-width="1.5" />`;
    // Body
    candlesHtml += `<rect x="${xCenter - candleWidth/2}" y="${topBodyY}" width="${candleWidth}" height="${bodyHeight}" fill="${color}" rx="1" />`;
  });
  
  // Header Formatting
  const nameLabel = metaData.longName || symbol.toUpperCase();
  const exchangeLabel = metaData.exchange || 'MARKET';
  const headerLine1 = `${nameLabel} · ${exchangeLabel}`;
  
  // OHLC format: O92.85 H94.79 L91.00 C93.16 +0.31 (+0.33%) Vol385.67K
  const openStr = lastV.open.toFixed(2);
  const highStr = lastV.high.toFixed(2);
  const lowStr = lastV.low.toFixed(2);
  const closeStr = lastV.close.toFixed(2);
  
  // Change vs previous day (using the last two days if available, else vs open)
  let dayChangeVal = lastV.close - lastV.open;
  let dayChangePct = ((dayChangeVal / lastV.open) * 100);
  if (values.length > 1) {
    const prevClose = values[values.length - 2].close;
    dayChangeVal = lastV.close - prevClose;
    dayChangePct = (dayChangeVal / prevClose) * 100;
  }
  const daySign = dayChangeVal >= 0 ? '+' : '';
  const dayColor = dayChangeVal >= 0 ? colors.bull : colors.bear;
  
  const ohlcText = `<tspan fill="${colors.textMuted}">O</tspan> <tspan fill="${colors.text}" class="num">${openStr}</tspan>   <tspan fill="${colors.textMuted}">H</tspan> <tspan fill="${colors.text}" class="num">${highStr}</tspan>   <tspan fill="${colors.textMuted}">L</tspan> <tspan fill="${colors.text}" class="num">${lowStr}</tspan>   <tspan fill="${colors.textMuted}">C</tspan> <tspan fill="${colors.text}" class="num">${closeStr}</tspan>   <tspan fill="${dayColor}" class="num">${daySign}${dayChangeVal.toFixed(2)} (${daySign}${dayChangePct.toFixed(2)}%)</tspan>   <tspan fill="${colors.textMuted}">Vol</tspan> <tspan fill="${colors.text}" class="num">${formatVolume(lastV.volume)}</tspan>`;

  // Draw current price line
  const currentY = mapY(lastV.close);
  const currentLineHtml = `
    <line x1="${pad.left}" y1="${currentY}" x2="${width - pad.right}" y2="${currentY}" stroke="${dayColor}" stroke-width="1" stroke-dasharray="4,4"/>
    <rect x="${width - pad.right}" y="${currentY - 10}" width="60" height="20" fill="${dayColor}" rx="3"/>
    <text x="${width - pad.right + 5}" y="${currentY + 4}" fill="${colors.bg === 'transparent' ? '#ffffff' : colors.bg || '#ffffff'}" font-size="11" font-weight="bold" class="num">${lastV.close.toFixed(2)}</text>
  `;

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
      <style>
        .num { font-family: "SF Mono", "Roboto Mono", Consolas, Menlo, Monaco, "Courier New", monospace; font-variant-numeric: tabular-nums; }
      </style>
      
      <!-- Border around chart area -->
      <rect x="${pad.left}" y="${pad.top}" width="${chartW}" height="${chartH}" fill="none" stroke="${colors.grid}" stroke-width="1"/>
      
      <!-- Grids -->
      ${gridHtml}
      
      <!-- Candles -->
      ${candlesHtml}
      
      <!-- Current Price Tag -->
      ${currentLineHtml}
      
      <!-- Headers -->
      <g>
        <text x="${pad.left}" y="24" font-size="18" font-weight="bold" fill="${colors.text}">${headerLine1}</text>
        <text x="${pad.left}" y="44" font-size="13">${ohlcText}</text>
      </g>
    </svg>
  `;
}

export default async function handler(req, res) {
  const { symbol = 'KSPI', period = '30d', theme = 'dark' } = req.query;
  
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
    numDays = parseInt(period, 10) || 30;
    periodLabel = `${numDays}D`;
  }
  
  const cacheKey = `${symbol.toUpperCase()}_${numDays}d_${theme.toLowerCase()}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { 
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    return res.send(cached.svg);
  }

  let values = [];
  let isError = false;
  let metaData = { longName: '', exchange: '' };

  try {
    if (!API_KEY) throw new Error("Missing Twelve Data API Key");
    
    const twelveDataUrl = `${BASE_URL}/time_series?symbol=${symbol}&interval=1day&outputsize=${numDays + 10}&apikey=${API_KEY}`;
    const tdResponse = await fetch(twelveDataUrl);
    const tdData = await tdResponse.json();

    if (tdData.status === 'ok' && tdData.values && tdData.values.length > 0) {
      metaData.longName = tdData.meta?.symbol || symbol.toUpperCase();
      metaData.exchange = tdData.meta?.exchange || 'MARKET';

      values = tdData.values.slice(0, numDays).reverse().map(v => ({
        date: v.datetime,
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
      period1.setDate(period1.getDate() - (numDays + 15)); 
      
      const queryOptions = { period1: period1, period2: new Date(), interval: '1d' };
      const yfData = await yahooFinance.chart(yfSymbol, queryOptions);
      
      if (!yfData || !yfData.quotes || yfData.quotes.length === 0) {
        throw new Error("Yahoo Finance returned no data");
      }
      
      metaData.longName = yfData.meta?.longName || yfData.meta?.shortName || yfData.meta?.symbol || symbol.toUpperCase();
      metaData.exchange = yfData.meta?.exchangeName || 'MARKET';

      const recentYfData = yfData.quotes.slice(-numDays);
      values = recentYfData.map(v => ({
        date: v.date,
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
      <svg width="850" height="450" viewBox="0 0 850 450" xmlns="http://www.w3.org/2000/svg">
        <text x="425" y="225" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" fill="#f23645" text-anchor="middle">Error fetching data for ${symbol.toUpperCase()}</text>
      </svg>
    `;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-store');
    res.status(400).send(errorSvg);
    return;
  }

  const svgContent = generateSVG(symbol, values, metaData, periodLabel, theme.toLowerCase());

  cache.set(cacheKey, { svg: svgContent, timestamp: Date.now() });

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.send(svgContent);
}
