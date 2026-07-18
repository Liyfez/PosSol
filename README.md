<p align="center">
  <img src="assets/logo.svg" alt="PosSol Logo" width="120" />
</p>

<h1 align="center">PosSol</h1>

<p align="center">
  <strong>Serverless, Auto-Updating Stock & Crypto Charts for your GitHub Profile</strong>
</p>

<p align="center">
  <a href="https://github.com/liyfez">
    <img src="assets/liyfezjs2.png" width="30%" alt="Liyfez GitHub Profile" />
  </a>
</p>

---

## 📋 Usage notes

- Add this snippet to your README:
  ```md
  ### <img src="https://raw.githubusercontent.com/Liyfez/PosSol/main/assets/logo.svg" width="32" style="vertical-align: middle; padding-bottom: 4px;" /> PosSol Stock View
  
  <p align="center">
    <img src="https://pos-sol.vercel.app/api/chart?symbol=AAPL&period=1y&theme=dark" width="48%">
  </p>
  ```

- To use another stock or crypto: change the value of `symbol=` (example: `symbol=AAPL`)
- To change the timeline: change the value of `period=` (example: `period=30d`, `6m`, `1y`)
- To use another theme: change the value of `theme=` (example: `theme=cyberpunk`)
- All available themes are shown below.
- Works perfectly out of the box with any stocks and crypto, Global stocks (e.g. `TSLA`, `MSFT`), and Crypto (e.g. `BTC/USD`, `ETH/USD`).

---

## 🎨 Available Themes

PosSol comes with 6 uniquely designed themes. To change the theme, just append `&theme={theme_name}` to your image URL!

### `dark` (Default)
<p align="center">
  <img src="https://pos-sol.vercel.app/api/chart?symbol=NVDA&period=30d&theme=dark" width="100%">
</p>

### `light`
<p align="center">
  <img src="https://pos-sol.vercel.app/api/chart?symbol=NVDA&period=30d&theme=light" width="100%">
</p>

### `monochrome`
<p align="center">
  <img src="https://pos-sol.vercel.app/api/chart?symbol=NVDA&period=30d&theme=monochrome" width="100%">
</p>

### `gray`
<p align="center">
  <img src="https://pos-sol.vercel.app/api/chart?symbol=NVDA&period=30d&theme=gray" width="100%">
</p>

### `blue`
<p align="center">
  <img src="https://pos-sol.vercel.app/api/chart?symbol=NVDA&period=30d&theme=blue" width="100%">
</p>

### `cyberpunk`
<p align="center">
  <img src="https://pos-sol.vercel.app/api/chart?symbol=NVDA&period=30d&theme=cyberpunk" width="100%">
</p>

---

## ⚙️ How it works

PosSol is built entirely on Serverless Edge Functions using native SVG generation. 
- **Zero Dependencies**: There are no heavy binaries or external charting libraries slowing it down.
- **Auto-updating Cache**: Charts are cached heavily at the Vercel edge (`s-maxage=300`), guaranteeing your profile loads instantly while keeping data perfectly fresh behind the scenes.
- **Fail-safe Fallbacks**: PosSol intelligently routes data between APIs to ensure 100% uptime for your profile.
