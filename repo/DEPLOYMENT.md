# PNG Website Builders — Vercel Deployment Guide

## Overview

This is a pnpm monorepo with two services:
- **Frontend** — React + Vite (served as static files by Vercel)
- **API** — Express.js (served as a Vercel Serverless Function at `/api`)

Auth: **Supabase Auth** | Emails: **Resend** | Database: **Supabase PostgreSQL**

---

## Step-by-Step Deployment to Vercel

1. Push all project files to your GitHub repository.
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub.
3. Set the root directory to `/` (where `vercel.json` lives).
4. Leave the framework preset as **"Other"**.
5. Add all Environment Variables (see list below).
6. Click **Deploy**.

---

## Required Environment Variables

Set all of these in **Vercel → Project → Settings → Environment Variables** for Production, Preview, and Development.

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase → Project Settings → Database → **Transaction pooler** connection string (port 6543) |
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` key (keep secret!) |
| `VITE_SUPABASE_URL` | Same value as `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` public key |
| `RESEND_API_KEY` | From [resend.com](https://resend.com) → API Keys |
| `RESEND_FROM_EMAIL` | Verified sender e.g. `noreply@pngwebsitebuilders.site` |
| `AI_INTEGRATIONS_OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1` |
| `AI_INTEGRATIONS_OPENROUTER_API_KEY` | From openrouter.ai → Keys |
| `NOWPAYMENTS_API_KEY` | From nowpayments.io → API Keys |
| `NOWPAYMENTS_IPN_SECRET` | From nowpayments.io → IPN Settings |
| `SESSION_SECRET` | Any long random string — run `openssl rand -hex 32` |
| `NODE_ENV` | `production` |

---

## Supabase Setup

### 1. Create a project at [supabase.com](https://supabase.com)

### 2. Get your connection string (for DATABASE_URL)
- Go to **Project Settings → Database → Connection string**
- Select **Transaction pooler** (port 6543)
- Copy the URL — looks like: `postgresql://postgres.xxxx:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

### 3. Get your API keys (for SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_ANON_KEY)
- Go to **Project Settings → API**
- Copy **Project URL** → set as `SUPABASE_URL` and `VITE_SUPABASE_URL`
- Copy **anon / public** key → set as `VITE_SUPABASE_ANON_KEY`
- Copy **service_role** key → set as `SUPABASE_SERVICE_ROLE_KEY` (never expose this in frontend!)

### 4. Configure Supabase Auth email settings
- Go to **Authentication → Settings → SMTP Settings**
- Enable custom SMTP and use your Resend SMTP credentials:
  - Host: `smtp.resend.com`
  - Port: `465`
  - Username: `resend`
  - Password: your Resend API key
- Or leave default — Supabase sends up to 3 auth emails/hour on free plan (use Resend SMTP to bypass this)

### 5. Run the database schema migration
```
pnpm --filter @workspace/db run push
```
Run this once from your local machine or Replit shell after setting `DATABASE_URL`.

---

## Resend Email Setup

1. Create an account at [resend.com](https://resend.com).
2. Go to **Domains** → Add `pngwebsitebuilders.site` and verify with DNS records.
3. Go to **API Keys** → Create key → copy it.
4. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in Vercel.

Emails sent automatically by your app:
- **Welcome email** — on first user signup
- **Payment confirmation** — when a NowPayments payment completes

---

## Custom Domain Setup

1. In Vercel → Project → Settings → **Domains**, add:
   - `pngwebsitebuilders.site`
   - `www.pngwebsitebuilders.site`
2. Add the DNS records shown at your domain registrar.

---

## NowPayments Webhook

After deploying, set your NowPayments IPN URL to:
```
https://pngwebsitebuilders.site/api/credits/webhook
```

---

## Support

Email: support@pngwebsitebuilders.site
