# ⚡ HUSTI — Aesthetic Offline-First Savings Habit PWA

<div align="center">
  
  ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
  ![Privacy: 100% Offline](https://img.shields.io/badge/Privacy-100%25%20Offline-emerald.svg?style=for-the-badge)
  ![Type: PWA](https://img.shields.io/badge/PWA-Supported-blue.svg?style=for-the-badge)
  ![Design: Neo-Brutalist](https://img.shields.io/badge/Design-Neo--Brutalist-volt.svg?style=for-the-badge&color=a3e635)
  
  <p align="center">
    <strong>A premium, light-themed money-saving habit calendar app. No accounts. No cloud database. No monthly subscription. Stored 100% on your device.</strong>
  </p>

  <h4>
    <a href="https://github.com/Praful-7723/husti-open">GitHub Repository</a>
    ·
    <a href="#-quickstart">Quickstart</a>
    ·
    <a href="#-features">Features</a>
  </h4>
</div>

---

## 📖 Why HUSTI?

Traditional budget applications focus on complex spreadsheets, manual transaction categorizations, and data-harvesting cloud accounts—often locking basic features behind monthly subscriptions. 

**HUSTI changes the game:**
- **Zero Account Creation**: Zero email requests, zero password registrations. Just open and track.
- **100% Offline**: Your financial data never leaves your device. It runs inside sandboxed local storage.
- **Habit-Driven Calendar**: Uses calendar grids to log daily savings streaks, visually motivating you to build consistent saving habits.

---

## 📐 Architecture Mapping

HUSTI splits marketing and PWA sandbox scope to maximize privacy, performance, and cache isolation:

```mermaid
graph TD
    subgraph Landing Website [Marketing Entry Gateway]
        Root[index.html] --> Styles[styles.css]
        Root --> Script[script.js]
        Root --> Switch[Custom Premium Emoji Slider]
    </div>
    subgraph PWA Sandbox [/app/ Subfolder]
        AppRoot[app/index.html] --> AppSW[app/sw.js]
        AppRoot --> AppManifest[app/manifest.webmanifest]
        AppRoot --> AppScript[app/script.js]
        AppRoot --> AppStyles[app/styles.css]
    </div>
    Root -- Download/Install CTA --> AppRoot
```

---

## ✨ Features Bento Grid

### 📅 Visual Calendar Tracker
Color-coded calendar circles showing daily progress points. Green circles representing successful saving streaks, and red representing skips.

### 🏷️ Quick Presets
One-tap savings logging buttons. Create customized presets for categories like "Food", "Travel", or "Investment" for sub-5 second logging.

### 📈 Smart Analytics
Local charts outlining Consistency indexes, 30-day savings trends, and streak records without any external telemetry.

### 🎯 Goals & Targets
Set custom targets (e.g. "New iPhone", "Emergency Fund") and watch the progress bars fill up with offsets.

### 💾 Private Backups
Export your local database into a tiny JSON file. Re-import or sync manually to any other device in seconds.

### 👑 Trophy Streaks
Gain achievements, Consistency badges, and milestones to turn saving money into a rewarding gamified routine.

---

## ⚡ Quickstart

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed to run the local Vite build script.

### 1. Clone the repository
```bash
git clone https://github.com/Praful-7723/husti-open.git
cd husti-open
```

### 2. Install dependencies
```bash
npm install
```

### 3. Compile assets
Compile the root landing page and sandboxed PWA into the production-ready `dist/` build directory:
```bash
npm run build
```

### 4. Serve local server
Launch serve locally on port `5190`:
```bash
npx serve dist -l 5190
```
- Open **[http://localhost:5190](http://localhost:5190)** to view the landing website.
- Open **[http://localhost:5190/app/](http://localhost:5190/app/)** to view the savings PWA app.

---

## 🚀 Deploy to Vercel

HUSTI is completely configured for zero-config Vercel hosting. 

1. Link your GitHub account to **[Vercel](https://vercel.com/)**.
2. Click **Add New Project** and select `husti-open`.
3. Vercel will automatically read [`vercel.json`](./vercel.json) and apply correct build commands:
   - **Framework Preset**: Other (Static)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Your premium HUSTI site is live!

---

## 🛠️ Contributing

We welcome contributions to expand the wallpaper list and calendar templates!
1. Fork the repo.
2. Add your custom styling adjustments.
3. Submit a Pull Request.

Designed & Developed by **[Praful](https://porfolio-rho-blush.vercel.app/)**
