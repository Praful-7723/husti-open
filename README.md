# ⚡ HUSTI — Aesthetic Offline-First Savings Habit PWA

<div align="center">
  <p align="center">
    A premium, neo-brutalist, light-themed savings habit calendar app that lives entirely on your device. Zero cloud databases. Zero accounts. Zero subscription fees.
  </p>

  <!-- GitHub stats & standard badges -->
  <a href="https://github.com/Praful-7723/husti-open/stargazers"><img src="https://img.shields.io/github/stars/Praful-7723/husti-open?style=for-the-badge&color=yellow" alt="Stars" /></a>
  <a href="https://github.com/Praful-7723/husti-open/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" /></a>
  <a href="https://github.com/Praful-7723/husti-open/commits/main"><img src="https://img.shields.io/github/last-commit/Praful-7723/husti-open?style=for-the-badge&color=green" alt="Last Commit" /></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps"><img src="https://img.shields.io/badge/PWA-100%25--Compatible-ff69b4?style=for-the-badge" alt="PWA Compatible" /></a>

  <br/><br/>

  <!-- Custom Link Badges in World Monitor style -->
  <table>
    <tr>
      <td><strong>🌐 WEB PORTAL</strong></td>
      <td><a href="https://husti-open.vercel.app"><img src="https://img.shields.io/badge/LANDING_PAGE-HUSTI--OPEN.VERCEL.APP-0070f3?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Vercel App" /></a></td>
    </tr>
    <tr>
      <td><strong>📱 PWA APP</strong></td>
      <td><a href="https://husti-open.vercel.app/app"><img src="https://img.shields.io/badge/OFFLINE_SANDBOX-HUSTI--OPEN.VERCEL.APP%2FAPP-47a248?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA App" /></a></td>
    </tr>
    <tr>
      <td><strong>🎨 DESIGN</strong></td>
      <td><img src="https://img.shields.io/badge/THEME-NEO--BRUTALIST-a3e635?style=for-the-badge&logo=tailwindcss&logoColor=black" alt="Design Theme" /></td>
    </tr>
    <tr>
      <td><strong>🔒 PRIVACY</strong></td>
      <td><img src="https://img.shields.io/badge/STORAGE-100%25_LOCAL_ONLY-ff4d6d?style=for-the-badge&logo=googlekeep&logoColor=white" alt="Privacy model" /></td>
    </tr>
  </table>

  <br/>

  <!-- Vercel quick deploy button -->
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FPraful-7723%2Fhusti-open"><img src="https://vercel.com/button" alt="Deploy with Vercel" height="38" /></a>

  <br/><br/>

  <h4>
    <a href="#-why-husti">Why HUSTI?</a>
    ·
    <a href="#-architecture-mapping">Architecture</a>
    ·
    <a href="#-features-bento-grid">Features</a>
    ·
    <a href="#-quickstart">Quickstart</a>
    ·
    <a href="#-vercel-deployment">Deploy</a>
  </h4>
</div>

---

## 📖 Why HUSTI?

Traditional budget apps focus on complex spreadsheets, endless transaction categorization, and data-harvesting cloud accounts—often locking basic habit tracking behind monthly subscriptions. 

**HUSTI redesigns the savings experience:**
- **Zero Account Creation:** Zero email requests, zero passwords. Just open the app and track.
- **100% Sandboxed LocalStorage:** Your financial statistics never touch the internet. Stored entirely inside browser client cache.
- **Habit-Driven Calendar:** Uses visual grid streaks to motivate consistent daily savings habits rather than boring transaction logs.

---

## 📐 Architecture Mapping

HUSTI splits the marketing entry and PWA sandbox scope to guarantee privacy, loading speed, and offline reliability:

```mermaid
flowchart TD
    subgraph Landing ["Landing Website (Marketing Entry Gateway)"]
        Root["index.html (Root Page)"]
        Styles["styles.css (Neo-Brutalist Layout)"]
        Script["script.js (Landing Actions)"]
        
        Root --> Styles
        Root --> Script
    end
    subgraph AppSandbox ["PWA Sandbox (/app/ subfolder)"]
        AppRoot["app/index.html (Offline Hub)"]
        AppSW["app/sw.js (Service Worker)"]
        AppManifest["app/manifest.webmanifest"]
        AppScript["app/script.js (State Engine)"]
        AppStyles["app/styles.css (PWA Layout)"]
        
        AppRoot --> AppSW
        AppRoot --> AppManifest
        AppRoot --> AppScript
        AppRoot --> AppStyles
    end
    Root -- "Install / Go to PWA App" --> AppRoot
```

---

## 🍱 Features Bento Grid

| Feature | Details | Tech Integration |
| :--- | :--- | :--- |
| 📅 **Visual Calendar** | Color-coded grid showing streaks and skips at a glance. | CSS Grid / LocalStorage |
| 🏷️ **Quick Presets** | Log savings in under 5 seconds with customizable one-tap buttons. | Presets Configuration |
| 📈 **Local Analytics** | Consistency score indexing, 30-day savings trends, no trackers. | Offline SVG Charts |
| 🎯 **Goal Progress** | Set targets (e.g. "Emergency Fund") and watch visual trackers fill. | Dynamic Offset Progress |
| 💾 **JSON Backups** | Export local state to a JSON file to transfer between devices. | File System API |
| 🏆 **Trophy Streaks** | Gamified daily milestones to keep saving habits fun. | Local Habit Engine |

---

## ⚡ Quickstart

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed to run Vite & local preview build steps.

### 1. Clone the repository
```bash
git clone https://github.com/Praful-7723/husti-open.git
cd husti-open
```

### 2. Install dependencies
```bash
npm install
```

### 3. Build static distribution files
```bash
npm run build
```

### 4. Serve preview server
Launch the local HTTP preview server:
```bash
npx serve . -l 5190
```
- Open **[http://localhost:5190](http://localhost:5190)** to view the Landing Website.
- Open **[http://localhost:5190/app/](http://localhost:5190/app/)** to run the offline PWA.

---

## 🚀 Vercel Deployment

HUSTI is fully configured for zero-config Vercel hosting. 

1. Link your GitHub account to **[Vercel](https://vercel.com/)**.
2. Click **Add New Project** and select `husti-open`.
3. Vercel automatically uses [`vercel.json`](./vercel.json) to apply correct builds:
   - **Framework Preset**: Other (Static Files)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Your premium HUSTI site is live!

---

## 🛠️ Contributing

We welcome contributions to expand color palettes, wallpapers, and templates!
1. Fork the repo.
2. Implement your adjustments.
3. Submit a Pull Request.

Designed & Developed by **[Praful](https://porfolio-rho-blush.vercel.app/)**
