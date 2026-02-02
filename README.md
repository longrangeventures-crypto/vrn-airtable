# VRN (Verified Response Network) — Airtable-powered Vercel Project

This is a clean restart project that pulls verified provider listings directly from your **public Airtable view**.

## Live data source (public view)
https://airtable.com/appqTkwG4v9gpDjl8/shrAUcmQU0GoSZYbu?format=json

No API keys are used.

## Run locally
```bash
npm install
npm run dev
```

## Deploy to Vercel (least confusing path)

### 1) Create a NEW GitHub repo
Name it something like: `vrn-airtable`

### 2) Upload files to GitHub (IMPORTANT)
Unzip this project and upload the **contents** so that your repo homepage shows:
- `package.json`
- `index.html`
- `src/`

(You should NOT have to click into any folder to see those.)

### 3) Create a NEW Vercel project
Vercel → Add New → Project → Import the GitHub repo.

Vercel should auto-detect:
- Framework: **Vite**
- Build: `npm run build`
- Output: `dist`

Deploy.

## Customize field names
This project reads these Airtable field names if present:
- Provider Name
- Provider Type
- Regions Served
- Mobilization Window
- Badges Earned
- Primary Contact Phone
- Primary Contact Email
- Website

If your Airtable uses different names, update `normalizeProviders()` in `src/App.jsx`.
