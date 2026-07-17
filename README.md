# ☀️ PosSol

**PosSol** (positive sun) is a serverless charting service that generates beautiful, dark-themed stock and crypto charts for GitHub profiles. It converts any trading symbol into a sleek, auto-updating PNG chart image.

## ✨ Features
- **Serverless & Edge Cached**: Built for Vercel. Cached heavily at the edge (`s-maxage=300`) to guarantee high performance and low API limits.
- **Auto-updating**: Every time a user visits your profile after the cache expires, they see the latest 7-day data.
- **Dual Data Sources**: Uses **Twelve Data** as the primary high-quality data provider for global stocks, crypto, and forex. Automatically falls back to **Yahoo Finance** if Twelve Data hits limits or errors.
- **Beautiful Design**: A sleek, dark GitHub-native aesthetic that turns green for positive trends and red for negative.

## 🚀 Usage

You can embed PosSol directly into your GitHub `README.md`:

```markdown
## 📈 My Market View
![Kaspi.kz](https://your-vercel-domain.vercel.app/api/chart?symbol=KSPI)
![Apple](https://your-vercel-domain.vercel.app/api/chart?symbol=AAPL)
![Bitcoin](https://your-vercel-domain.vercel.app/api/chart?symbol=BTC/USD)
```

Change the `symbol` query parameter to track anything on the London Stock Exchange, NASDAQ, Crypto, etc. You can also specify `days` (e.g. `?symbol=AAPL&days=30`).

## 🛠 Deployment & Setup

1. **Clone the Repo:**
   ```bash
   git clone https://github.com/your-username/PosSol.git
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

Then visit `http://localhost:3000/api/chart?symbol=AAPL`.
