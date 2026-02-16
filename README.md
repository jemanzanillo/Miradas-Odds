# Miradas! Lac Banquet — Prediction App

A mobile-first prediction app for the Lac Banquet event. Attendees vote for which King the Queen will choose. The display page shows live results and a QR code for easy voting.

## Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Vercel Serverless Functions
- **Storage**: Upstash Redis (via Vercel Marketplace)

## Setup

### 1. Add Upstash Redis

1. In your [Vercel Dashboard](https://vercel.com/dashboard), open your project
2. Go to **Storage** → **Create Database**
3. Choose **Upstash Redis** from the Marketplace
4. Create the database and connect it to your project

Vercel will inject `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` into your project.

**Important:** After connecting Upstash, you must **redeploy** for the env vars to be available. Go to Vercel → your project → Deployments → click the ⋮ menu on the latest deployment → Redeploy.

### 2. Deploy to Vercel

```bash
npm install
vercel
```

Or connect your GitHub repo in the Vercel dashboard for automatic deployments.

## Routes

- **/** — Voting page (mobile-friendly). Attendees enter their name and pick a King.
- **/display** — Live board with vote counts and QR code for the voting URL.

## API

- `POST /api/vote` — Submit a vote. Body: `{ "name": "string", "kingId": "string" }`
- `GET /api/votes` — Fetch current vote counts.

## Resetting Votes

To reset all votes (e.g., for a new event round), update the `VERSION` constant in `api/vote.js` to a new value and redeploy. This will clear all stored votes and voter data.

Example:
```javascript
const VERSION = '1.1'; // Change this number to reset votes
```

## Troubleshooting

**"Database not configured"** — Usually means env vars aren't available to the deployment:

1. **Redeploy** after connecting Upstash — env vars are injected only on new deployments.
2. **Verify env vars** — In Vercel → Project Settings → Environment Variables, confirm `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` exist (or `KV_REST_API_URL` / `KV_REST_API_TOKEN`).
3. **Manual setup** — If they're missing, copy them from [Upstash Console](https://console.upstash.com/) → your database → REST API, and add them in Vercel Environment Variables.
