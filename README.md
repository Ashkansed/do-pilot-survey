# DO Customer Success Survey

Web-based survey for Dimension Ortho pilot feedback, based on the Customer Success Survey document. Share via QR code for easy mobile access.

## Quick Start

```bash
npm install
npm start
```

Then open:

| Page | URL |
|------|-----|
| **Survey** | http://localhost:3000 |
| **Share (QR Code)** | http://localhost:3000/share.html |
| **Admin Dashboard** | http://localhost:3000/admin.html |

## Features

- All questions from the original survey (3 sections, 1–5 ratings, open feedback)
- QR code generation for easy sharing — print or display at clinics
- Copy survey link to clipboard
- Download printable QR code
- Response storage with admin dashboard
- Export all responses to CSV

## Sharing for Production

For participants to access the survey from their phones, deploy to Render as a **Web Service** (not Static Site).

### Render setup (free)

1. Go to [render.com](https://render.com) → **New** → **Web Service** (not Static Site)
2. Connect your GitHub repo: `Ashkansed/do-pilot-survey`
3. Use these settings:

| Field | Value |
|-------|-------|
| **Name** | `do-customer-success-survey` |
| **Branch** | `main` |
| **Root Directory** | *(leave blank)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

4. Add an environment variable:
   - **Key:** `PUBLIC_URL`
   - **Value:** your Render URL, e.g. `https://do-customer-success-survey.onrender.com`
     *(set this after the first deploy, then redeploy once so the QR code uses the correct link)*

5. Click **Create Web Service**

Or use the included `render.yaml` blueprint: **New** → **Blueprint** → connect the repo.

For participants to access the survey from their phones, deploy to a server with a public URL and set:

```bash
PUBLIC_URL=https://your-domain.com npm start
```

The QR code will automatically point to your public URL.

### Deployment options

- **Railway / Render / Fly.io** — deploy this Node.js app
- **Local network** — run on your machine and use your LAN IP (e.g. `http://192.168.1.10:3000`) for QR codes on the same WiFi

## Data

Responses are stored in `data/responses.json`. Back this up regularly or export via CSV from the admin dashboard.
