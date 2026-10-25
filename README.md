# KisanMandi Pakistan - زرعی منڈی پاکستان

A modern, production-grade agricultural marketplace web application designed for Pakistani farmers, buyers, commission agents, and mandi traders.

---

## 🌟 Features Overview

- **Bilingual Interface**: Seamless 1-tap toggle between **English** and **Urdu (اردو)** across all pages and dialogs.
- **Crop Listings & Marketplace**: Buy and sell Wheat (گندم), Cotton (کپاس), Rice (چاول), Maize (مکئی), Sugar (گنا/چینی), Pulses (دالیں), Oilseeds (تیل والے بیج), Fruits & Vegetables.
- **Live Mandi Rates**: Daily market rates with province filters (Punjab, Sindh, KPK, Balochistan), mandi-wise breakdown, minimum, maximum, and average prices, with 7-day trend history.
- **Contact Unlock & Monetization System**:
  - New users automatically receive **Rs. 100 Welcome Promotional Balance** (granting 10 free seller contact unlocks at Rs. 10 per unlock).
  - Welcome bonus is non-withdrawable and strictly reserved for unlocking contacts.
  - Users can top up balance via JazzCash, EasyPaisa, or Bank Transfer once free unlocks are exhausted.
- **Referral Program**: Users get bonus unlocks for inviting fellow farmers via WhatsApp/SMS.
- **Admin Dashboard**: Accessible with PIN `2468` (or 5 quick taps on the header logo) for managing ads, approving transactions, and analytics.
- **PWA & Mobile Ready**: Full offline caching, Web App Manifest, splash screen, and responsive mobile layout with bottom navigation bar.

---

## 🚀 Getting Started for Developers

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** or **yarn**

### 1. Installation
Extract the ZIP file and run:
```bash
npm install
```

### 2. Run in Development Mode
Starts the Express API server with Vite middleware integrated on port `3000`:
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Build for Production
Compiles TypeScript and generates optimized client assets in `dist/`:
```bash
npm run build
```

### 4. Run Production Server
```bash
npm start
```

---

## 📱 How to Build Android APK

There are two recommended methods to turn this application into an installable `.apk` file:

### Method 1: Using Capacitor (Recommended - Creates Native Android Project)
1. Install Capacitor dependencies:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```
2. Initialize Capacitor:
   ```bash
   npx cap init "KisanMandi" "com.kisanmandi.app" --web-dir dist
   ```
3. Build the web assets:
   ```bash
   npm run build
   ```
4. Add the Android platform:
   ```bash
   npx cap add android
   ```
5. Open in Android Studio:
   ```bash
   npx cap open android
   ```
6. In **Android Studio**:
   - Go to menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - Android Studio will generate the `app-debug.apk` file in `android/app/build/outputs/apk/debug/`.
   - You can directly install this `.apk` on any Android device!

### Method 2: Google Bubblewrap (Trusted Web Activity APK)
1. Install Bubblewrap CLI:
   ```bash
   npm install -g @bubblewrap/cli
   ```
2. Run bubblewrap with the manifest:
   ```bash
   bubblewrap init --manifest ./public/manifest.json
   bubblewrap build
   ```

---

## 📂 Project Architecture

```
├── README.md               # Developer documentation (this file)
├── package.json            # Node dependencies and build scripts
├── tsconfig.json           # TypeScript compiler configuration
├── vite.config.ts          # Vite build config with Tailwind CSS integration
├── index.html              # HTML5 entry point with PWA meta tags & icons
├── server.ts               # Express backend API server (port 3000)
├── public/                 # Static assets, icons, manifest.json, sw.js
│   ├── manifest.json       # Web App Manifest for mobile installability
│   ├── sw.js               # Service Worker for offline support
│   ├── icon-192.png        # Standard mobile app icon (192x192)
│   ├── icon-512.png        # High-res mobile app icon (512x512)
│   ├── icon-maskable-512.png # Adaptive maskable icon for Android squircles
│   └── apple-touch-icon.png  # iOS Safari home screen icon
├── src/
│   ├── main.tsx            # React application root mount
│   ├── App.tsx             # Primary container, bottom navigation, modals
│   ├── index.css           # Tailwind CSS directives and custom typography
│   ├── components/         # Modular React components
│   │   ├── Header.tsx          # Top navbar with language toggle, search, install CTA
│   │   ├── MandiTicker.tsx     # Real-time scrolling ticker of live crop rates
│   │   ├── LiveRatesModal.tsx  # Full mandi rates directory with 7-day charts
│   │   ├── AccountModal.tsx    # Customer profile, wallet balance, logout
│   │   ├── CropDetailModal.tsx # Ad viewer with contact unlock payment gate
│   │   ├── PostCropModal.tsx   # Ad creation form for selling crops
│   │   ├── AdminPanelModal.tsx # Backoffice for ad moderation and metrics
│   │   ├── InstallAppModal.tsx # PWA 1-click install & QR code sharing modal
│   │   └── ...
│   ├── data/
│   │   ├── mandiRatesData.ts   # Live Pakistani mandi market rates dataset
│   │   └── seedData.ts         # Initial crops, users, and transactions
│   ├── services/
│   │   └── storageService.ts   # Local persistence, wallet logic, unlock verification
│   └── types/
│       └── index.ts            # TypeScript interfaces and domain types
```

---

## 🔑 Key Credentials & Defaults

- **Admin Login PIN**: `2468`
- **Default Port**: `3000`
- **Initial Free Balance**: `Rs. 100` (10 contact unlocks @ Rs. 10 each)
- **Support Contact**: `0300-1234567` (WhatsApp / Phone)

---
## Python server (quick testing, no Node needed for the server)
```
pip install flask
python server.py        # http://localhost:3000
```
It serves the same `/api/...` as `server.ts` and the built app from `dist/` (create it with `npm run build`,
or let GitHub Actions build it — see `.github/workflows/apk.yml`, which also builds the Android APK).
