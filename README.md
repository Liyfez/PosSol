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

## 📋 Usage notes

- Add this snippet to your README:
  ```md
  ### <img src="https://raw.githubusercontent.com/Liyfez/PosSol/main/assets/logo.svg" width="32" style="vertical-align: middle; padding-bottom: 4px;" /> PosSol Stock View
  
  <p align="center">
    <img src="https://pos-sol.vercel.app/api/chart?symbol=KSPI&period=6m" width="48%">
    <img src="https://pos-sol.vercel.app/api/chart?symbol=AAPL&period=1y" width="48%">
  </p>
  ```

- To use another stock or crypto: change the value of `symbol=` (example: `symbol=AAPL`)
- To change the timeline: change the value of `period=` (example: `period=30d`, `6m`, `1y`)
- Works perfectly out of the box with Kazkah stocks (e.g. `KSPI`, `HSBK`, `KAP`), Global stocks (e.g. `TSLA`, `MSFT`), and Crypto (e.g. `BTC/USD`, `ETH/USD`).

---

## 🌟 Showcasing Examples

Here is how different timelines look when rendered:

### Kaspi.kz (Last 30 Days)
<p align="center">
  <img src="https://pos-sol.vercel.app/api/chart?symbol=KSPI&period=30d" width="100%">
</p>

### Bitcoin (Last 6 Months)
<p align="center">
  <img src="https://pos-sol.vercel.app/api/chart?symbol=BTC/USD&period=6m" width="100%">
</p>

---

## ⚙️ How it works

PosSol is built entirely on Serverless Edge Functions using native SVG generation. 
- **Zero Dependencies**: There are no heavy binaries or external charting libraries slowing it down.
- **Auto-updating Cache**: Charts are cached heavily at the Vercel edge (`s-maxage=300`), guaranteeing your profile loads instantly while keeping data perfectly fresh behind the scenes.
- **Fail-safe Fallbacks**: PosSol intelligently routes data between APIs to ensure 100% uptime for your profile.
