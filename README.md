<p align="center">
  <img src="assets/logo.svg" alt="PosSol Logo" width="120"/>
</p>

<h1 align="center">☀️ PosSol</h1>

<p align="center">
  <strong>A serverless charting service that generates beautiful, dark-themed stock and crypto candlestick charts for GitHub profiles.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vercel-Serverless-black?style=for-the-badge&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/Chart-SVG-blue?style=for-the-badge" alt="SVG">
  <img src="https://img.shields.io/badge/License-Custom-red?style=for-the-badge" alt="License">
</p>

---

## ✨ Features
- **Zero Dependencies**: Pure, manual SVG generation without heavy canvas libraries. Sub-millisecond rendering!
- **Serverless & Edge Cached**: Built for Vercel. Cached heavily at the edge (`s-maxage=300`) to guarantee high performance and avoid API rate limits.
- **Auto-updating**: Every time a user visits your profile after the cache expires, they see the latest real-time data.
- **Dual Data Sources**: Uses **Twelve Data** as the primary high-quality data provider. Automatically falls back to **Yahoo Finance** with smart symbol mapping.
- **Pro Aesthetics**: Features a sleek, dark TradingView-like aesthetic with accurate candlestick drawing, grids, and dynamic OHLC headers.

---

## 🚀 Embed in your Profile

You can embed PosSol directly into your GitHub `README.md` to show off your favorite stocks or crypto. 

Copy the code below:

```html
<h3><img src="https://raw.githubusercontent.com/Liyfez/PosSol/main/assets/logo.svg" width="24" align="top"/> PosSol Stock View</h3>

<!-- 
  HOW TO CUSTOMIZE YOUR CHART:
  1. Change "symbol=KSPI" to any stock or crypto (e.g., symbol=AAPL, symbol=BTC/USD)
  2. Change "period=6m" to your preferred timeline (e.g., period=30d, period=1y, period=7d)
-->
<p align="center">
  <img src="https://pos-sol.vercel.app/api/chart?symbol=KSPI&period=6m" alt="Kaspi.kz Chart" />
</p>

<p align="center">
  <img src="https://pos-sol.vercel.app/api/chart?symbol=AAPL&period=1y" alt="Apple Chart" width="48%" />
  <img src="https://pos-sol.vercel.app/api/chart?symbol=BTC/USD&period=30d" alt="Bitcoin Chart" width="48%" />
</p>
```

---

## 🛠 Deployment & Setup

If you want to host your own instance of PosSol:

1. **Clone the Repo:**
   ```bash
   git clone https://github.com/Liyfez/PosSol.git
   cd PosSol
   npm install
   ```

2. **Get API Key:**
   Sign up for a free account at [Twelve Data](https://twelvedata.com/) and copy your API key.

3. **Deploy to Vercel:**
   - Push this repo to GitHub.
   - Import it into Vercel.
   - Set the `TWELVE_DATA_KEY` environment variable in Vercel to your API key.
   - Deploy!

## 🧪 Testing Locally

To test the serverless function locally, create a `.env` file with your `TWELVE_DATA_KEY` and run:

```bash
npx vercel dev
```

Then visit `http://localhost:3000/api/chart?symbol=AAPL&period=30d`.

---

## 📜 License
This project is protected under a custom proprietary license. You are free to use it for your personal GitHub profiles, but you may not claim ownership, clone it as your own original work, or use it commercially. See the `LICENSE` file for details.
