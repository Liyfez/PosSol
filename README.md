<p align="center">
  <img src="assets/logo.svg" alt="PosSol Logo" width="120" />
</p>

<h1 align="center">PosSol</h1>

<p align="center">
  <strong>Serverless, Auto-Updating Stock & Crypto Charts for your GitHub Profile</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/Liyfez/PosSol?style=flat-square&color=089981" alt="License" />
  <img src="https://img.shields.io/badge/Made%20for-GitHub%20Profiles-1c1e21?style=flat-square&logo=github" alt="GitHub Profiles" />
  <img src="https://img.shields.io/badge/Powered%20by-Vercel-black?style=flat-square&logo=vercel" alt="Vercel" />
</p>

---

**PosSol** (positive sun) is a serverless charting service that generates beautiful, dark-themed, professional candlestick charts for stocks and crypto. It turns any trading symbol into a sleek, auto-updating SVG image that you can embed directly into your GitHub `README.md`.

## ✨ Features
- **Zero Dependencies**: Generates 100% native SVGs on the fly. Ultra-fast, infinitely scalable, and no heavy `canvas` binaries!
- **Professional Aesthetics**: Matches the iconic TradingView dark theme with accurate candlesticks, wicks, grids, OHLC data, and volume tracking.
- **Auto-updating**: Cached heavily at the Vercel edge (`s-maxage=300`). Every time a user visits your profile, they see the latest data without hitting API limits.
- **Dual Data Sources**: Uses **Twelve Data** as the primary high-quality provider, and intelligently falls back to **Yahoo Finance** if needed.
- **Smart Symbol Mapping**: Automatically maps Kazkah and International stocks (e.g. `KSPI`, `HSBK`, `ASML`) to their correct Yahoo Finance equivalents to ensure 100% uptime.

---

## 🚀 How to use in your GitHub Profile

You can embed PosSol directly into your GitHub `README.md`. Just copy the markdown below!

```markdown
### <img src="https://raw.githubusercontent.com/Liyfez/PosSol/main/assets/logo.svg" width="24" style="vertical-align: middle;" /> PosSol Stock View

<p align="center">
  <!-- Change `symbol=KSPI` to any stock/crypto you want (e.g., AAPL, TSLA, BTC/USD) -->
  <!-- Change `period=6m` to change the timeline (e.g., 7d, 30d, 6m, 1y) -->
  <img src="https://pos-sol.vercel.app/api/chart?symbol=KSPI&period=6m" width="48%">
  
  <!-- Example: Apple stock over the last 1 year -->
  <img src="https://pos-sol.vercel.app/api/chart?symbol=AAPL&period=1y" width="48%">
</p>

<p align="center">
  <!-- Example: Bitcoin over the last 30 days -->
  <img src="https://pos-sol.vercel.app/api/chart?symbol=BTC/USD&period=30d" width="48%">
  
  <!-- Example: Tesla stock over the last 6 months -->
  <img src="https://pos-sol.vercel.app/api/chart?symbol=TSLA&period=6m" width="48%">
</p>
```

---

## 🛠 Deployment & Setup

Want to host your own instance? It's incredibly easy and 100% free.

1. **Clone the Repo:**
   ```bash
   git clone https://github.com/Liyfez/PosSol.git
   cd PosSol
   npm install
   ```

2. **Get API Key:**
   Sign up for a free account at [Twelve Data](https://twelvedata.com/) and copy your API key.

3. **Deploy to Vercel:**
   - Import this repo into Vercel.
   - Set the `TWELVE_DATA_KEY` environment variable in Vercel to your API key.
   - Deploy!

## 🧪 Testing Locally

To test the serverless function locally, create a `.env` file with your `TWELVE_DATA_KEY` and run:

```bash
npx vercel dev
```

Then visit `http://localhost:3000/api/chart?symbol=AAPL&period=30d`.

## 📜 License
This project is licensed under the **GNU General Public License v3.0**. You are free to use it, but you may not claim it as your own work. See the `LICENSE` file for details.
