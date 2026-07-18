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
function generateSVG(symbol, values, metaData, periodLabel, themeName, isMini) {
  // Mini mode uses smaller dimensions so candles appear larger when scaled down
  const width = isMini ? 500 : 850;
  const height = isMini ? 280 : 450;
  
  const themes = {
    dark: { bull: '#089981', bear: '#f23645', grid: '#2a2e39', text: '#d1d4dc', textMuted: '#787b86' },
    monochrome: { bull: '#ffffff', bear: '#555555', grid: '#333333', text: '#ffffff', textMuted: '#a3a3a3' },
    abyss: { bull: '#00f2fe', bear: '#4facfe', grid: '#162e45', text: '#e0f7fa', textMuted: '#80deea' },
    evangelion: { bull: '#a8ff78', bear: '#b01eff', grid: '#243b35', text: '#f0fdf4', textMuted: '#bbf7d0' },
    nebula: { bull: '#ff7eb3', bear: '#654ea3', grid: '#3b2354', text: '#fce7f3', textMuted: '#fbcfe8' },
    sakura: { bull: '#ffb7b2', bear: '#d65b64', grid: 'transparent', text: '#fce3eb', textMuted: '#ff9a9e' },
    obsidian: { bull: '#eab308', bear: '#737373', grid: '#171717', text: '#ffffff', textMuted: '#a3a3a3' },
    matrix: { bull: '#00ff41', bear: '#008f11', grid: '#1a1a1a', text: '#ffffff', textMuted: '#888888' },
    midnight: { bull: '#34d399', bear: '#f43f5e', grid: '#0f172a', text: '#f1f5f9', textMuted: '#64748b' },
    oceanic: { bull: '#0ea5e9', bear: '#fb923c', grid: '#082f49', text: '#e0f2fe', textMuted: '#7dd3fc' },
    cyber: { bull: '#06b6d4', bear: '#d946ef', grid: '#2e1065', text: '#f3e8ff', textMuted: '#c084fc' },
    emerald: { bull: '#10b981', bear: '#f59e0b', grid: '#064e3b', text: '#ecfdf5', textMuted: '#6ee7b7' }
  };
  
  const colors = themes[themeName] || themes.dark;

  // Padding
  const pad = isMini 
    ? { top: 45, right: 55, bottom: 25, left: 15 }
    : { top: 60, right: 70, bottom: 30, left: 20 };
    
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
  // Make candles use 80% of the available space
  const candleWidth = Math.max(1, candleSpace * 0.8);

  const mapY = (val) => pad.top + chartH - ((val - chartMinY) / range) * chartH;
  const mapX = (idx) => pad.left + (idx + 0.5) * candleSpace;

  let gridHtml = '';
  
  // Always render Y-axis grid lines & labels (Price)
  const yTicks = isMini ? 3 : 5;
  for (let i = 0; i <= yTicks; i++) {
    const val = chartMinY + (i / yTicks) * range;
    const y = mapY(val);
    if (colors.grid !== 'transparent') {
      gridHtml += `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="${colors.grid}" stroke-width="1" stroke-dasharray="2,2"/>`;
    }
    gridHtml += `<text x="${width - pad.right + 6}" y="${y + 4}" fill="${colors.textMuted}" font-size="${isMini ? 9 : 11}" class="num shadow">${val.toFixed(2)}</text>`;
  }

  // Always render X-axis grid lines & labels (Time)
  const xTicks = isMini ? 2 : 4;
  for (let i = 0; i <= xTicks; i++) {
    const idx = Math.floor((i / xTicks) * (values.length - 1));
    if (idx >= 0 && idx < values.length) {
      const x = mapX(idx);
      const v = values[idx];
      if (colors.grid !== 'transparent') {
        gridHtml += `<line x1="${x}" y1="${pad.top}" x2="${x}" y2="${height - pad.bottom}" stroke="${colors.grid}" stroke-width="1" stroke-dasharray="2,2"/>`;
      }
      gridHtml += `<text x="${x}" y="${height - pad.bottom + 16}" fill="${colors.textMuted}" font-size="${isMini ? 9 : 11}" text-anchor="middle" class="num shadow">${formatDate(v.date)}</text>`;
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
    candlesHtml += `<line x1="${xCenter}" y1="${highY}" x2="${xCenter}" y2="${lowY}" stroke="${color}" stroke-width="${isMini ? 2 : 1.5}" />`;
    // Body
    candlesHtml += `<rect x="${xCenter - candleWidth/2}" y="${topBodyY}" width="${candleWidth}" height="${bodyHeight}" fill="${color}" rx="1" />`;
  });
  
  // Headers and OHLC
  const lastV = values[values.length - 1];
  const firstV = values[0];
  
  const nameLabel = metaData.longName || symbol.toUpperCase();
  const exchangeLabel = metaData.exchange || 'MARKET';
  const headerLine1 = `${nameLabel} · ${exchangeLabel}`;
  
  const openStr = lastV.open.toFixed(2);
  const highStr = lastV.high.toFixed(2);
  const lowStr = lastV.low.toFixed(2);
  const closeStr = lastV.close.toFixed(2);
  
  let dayChangeVal = lastV.close - lastV.open;
  let dayChangePct = ((dayChangeVal / lastV.open) * 100);
  if (values.length > 1) {
    const prevClose = values[values.length - 2].close;
    dayChangeVal = lastV.close - prevClose;
    dayChangePct = (dayChangeVal / prevClose) * 100;
  }
  const daySign = dayChangeVal >= 0 ? '+' : '';
  const dayColor = dayChangeVal >= 0 ? colors.bull : colors.bear;
  
  // If mini mode, we show a simplified OHLC text to prevent clipping
  const ohlcText = isMini
    ? `<tspan fill="${colors.textMuted}">C</tspan> <tspan fill="${colors.text}" class="num">${closeStr}</tspan>   <tspan fill="${dayColor}" class="num">${daySign}${dayChangeVal.toFixed(2)} (${daySign}${dayChangePct.toFixed(2)}%)</tspan>`
    : `<tspan fill="${colors.textMuted}">O</tspan> <tspan fill="${colors.text}" class="num">${openStr}</tspan>   <tspan fill="${colors.textMuted}">H</tspan> <tspan fill="${colors.text}" class="num">${highStr}</tspan>   <tspan fill="${colors.textMuted}">L</tspan> <tspan fill="${colors.text}" class="num">${lowStr}</tspan>   <tspan fill="${colors.textMuted}">C</tspan> <tspan fill="${colors.text}" class="num">${closeStr}</tspan>   <tspan fill="${dayColor}" class="num">${daySign}${dayChangeVal.toFixed(2)} (${daySign}${dayChangePct.toFixed(2)}%)</tspan>   <tspan fill="${colors.textMuted}">Vol</tspan> <tspan fill="${colors.text}" class="num">${formatVolume(lastV.volume)}</tspan>`;

  const currentY = mapY(lastV.close);
  const priceTextColor = (dayColor === '#ffffff' || dayColor === '#a8ff78' || dayColor === '#00ff41' || dayColor === '#eab308' || dayColor === '#34d399' || dayColor === '#fb923c' || dayColor === '#f59e0b' || dayColor === '#06b6d4') ? '#000000' : '#ffffff';
  
  const currentLineHtml = `
    <line x1="${pad.left}" y1="${currentY}" x2="${width - pad.right}" y2="${currentY}" stroke="${dayColor}" stroke-width="1" stroke-dasharray="4,4"/>
    <rect x="${width - pad.right}" y="${currentY - (isMini ? 8 : 10)}" width="${isMini ? 50 : 60}" height="${isMini ? 16 : 20}" fill="${dayColor}" rx="3"/>
    <text x="${width - pad.right + 4}" y="${currentY + (isMini ? 3 : 4)}" fill="${priceTextColor}" font-size="${isMini ? 9 : 11}" font-weight="bold" class="num">${lastV.close.toFixed(2)}</text>
  `;
  
  const headerHtml = `
    <!-- Current Price Tag -->
    ${currentLineHtml}
    
    <!-- Headers -->
    <g class="shadow">
      <text x="${pad.left}" y="${isMini ? 18 : 24}" font-size="${isMini ? 14 : 18}" font-weight="bold" fill="${colors.text}">${headerLine1}</text>
      <text x="${pad.left}" y="${isMini ? 34 : 44}" font-size="${isMini ? 10 : 13}">${ohlcText}</text>
    </g>
  `;

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
      <defs>
        <filter id="text-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.8"/>
        </filter>
      </defs>
      <style>
        .num { font-family: "SF Mono", "Roboto Mono", Consolas, Menlo, Monaco, "Courier New", monospace; font-variant-numeric: tabular-nums; }
        .shadow { filter: url(#text-shadow); }
      </style>
      
      <!-- Border around chart area -->
      ${colors.grid !== 'transparent' ? `<rect x="${pad.left}" y="${pad.top}" width="${chartW}" height="${chartH}" fill="none" stroke="${colors.grid}" stroke-width="1"/>` : ''}
      
      <!-- Grids -->
      ${gridHtml}
      
      <!-- Candles -->
      ${candlesHtml}
      
      ${headerHtml}
    </svg>
  `;
}

// Function to generate fake aesthetic data for themes preview
function generateFakeData(numDays) {
  let values = [];
  let currentPrice = 100;
  for (let i = 0; i < numDays; i++) {
    const volatility = 5;
    const open = currentPrice;
    const close = currentPrice + (Math.random() - 0.45) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    
    values.push({
      date: new Date(Date.now() - (numDays - i) * 86400000).toISOString(),
      open, high, low, close, volume: Math.floor(Math.random() * 1000000)
    });
    currentPrice = close;
  }
  return values;
}

export default async function handler(req, res) {
  const { symbol = 'KSPI', period = '30d', theme = 'dark', mini = 'false', fake = 'false' } = req.query;
  
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
  
  const isMini = mini === 'true';
  const isFake = fake === 'true';
  
  // Adding v2 to cache key to instantly bust the cache
  const cacheKey = `${symbol.toUpperCase()}_${numDays}d_${theme.toLowerCase()}_mini${isMini}_fake${isFake}_v2`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { 
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    return res.send(cached.svg);
  }

  let values = [];
  let isError = false;
  let metaData = { longName: '', exchange: '' };

  if (isFake) {
    values = generateFakeData(isMini ? 15 : numDays);
    metaData = { longName: 'Theme Preview', exchange: 'AESTHETIC' };
  } else {
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
  }

  if (isError || values.length === 0) {
    const errorSvg = `
      <svg width="${isMini ? 500 : 850}" height="${isMini ? 280 : 450}" viewBox="0 0 ${isMini ? 500 : 850} ${isMini ? 280 : 450}" xmlns="http://www.w3.org/2000/svg">
        <text x="${isMini ? 250 : 425}" y="${isMini ? 140 : 225}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" fill="#f23645" text-anchor="middle">Error fetching data</text>
      </svg>
    `;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-store');
    res.status(400).send(errorSvg);
    return;
  }

  const svgContent = generateSVG(symbol, values, metaData, periodLabel, theme.toLowerCase(), isMini);

  cache.set(cacheKey, { svg: svgContent, timestamp: Date.now() });

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.send(svgContent);
}
