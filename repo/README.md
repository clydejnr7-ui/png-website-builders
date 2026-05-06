# PNG Website Builders

Papua New Guinea's AI-powered website builder. Describe your business → get a professional website in seconds.

**Stack:** React + Vite · Express · Supabase Auth · Drizzle ORM · PostgreSQL · NowPayments · Resend · OpenRouter AI · Vercel

---

## Monorepo Structure

```
/
├── apps/
│   ├── api-server/          # Express API (Vercel Serverless Function)
│   └── sitecraft/           # React + Vite frontend
├── packages/
│   ├── db/                  # Drizzle schema + Postgres client
│   ├── api-zod/             # Shared Zod request/response schemas
│   ├── api-client-react/    # TanStack Query hooks for the API
│   └── integrations-openrouter-ai/  # OpenRouter AI client
├── api/
│   └── index.ts             # Vercel serverless entry for the API
└── vercel.json              # Routing: SPA rewrites + API function
```

---

## Quick Start (Local Dev)

### Prerequisites
- Node.js 20+
- pnpm 9+ (`npm i -g pnpm`)
- A [Supabase](https://supabase.com) project
- A [Resend](https://resend.com) account
- An [OpenRouter](https://openrouter.ai) API key
- A [NowPayments](https://nowpayments.io) account

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set environment variables

Create `apps/api-server/.env`:

```env
DATABASE_URL=postgresql://postgres.xxxx:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@pngwebsitebuilders.site
AI_INTEGRATIONS_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
AI_INTEGRATIONS_OPENROUTER_API_KEY=sk-or-...
NOWPAYMENTS_API_KEY=...
NOWPAYMENTS_IPN_SECRET=...
SESSION_SECRET=your-random-secret
NODE_ENV=development
PORT=3001
```

Create `apps/sitecraft/.env.local`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Push the database schema

```bash
pnpm db:push
```

### 4. Run locally

In separate terminals:

```bash
# Terminal 1 — API
pnpm dev:api

# Terminal 2 — Frontend (proxies /api → localhost:3001)
pnpm dev:web
```

Visit [http://localhost:5173](http://localhost:5173)

---

## Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full step-by-step guide including Supabase setup, Resend email verification, NowPayments webhook configuration, and custom domain setup.

**Quick deploy:**
1. Push this repo to GitHub
2. Import in [vercel.com](https://vercel.com) → New Project
3. Add all environment variables from `DEPLOYMENT.md`
4. Click Deploy

---

## Adding more shadcn/ui components

The project uses [shadcn/ui](https://ui.shadcn.com). To add more components:

```bash
cd apps/sitecraft
npx shadcn@latest add [component-name]
```

---

## Environment Variables Reference

| Variable | Where | Description |
|---|---|---|
| `DATABASE_URL` | API | Supabase transaction pooler (port 6543) |
| `SUPABASE_URL` | API | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | API | Supabase service role key (secret!) |
| `VITE_SUPABASE_URL` | Frontend | Same as SUPABASE_URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase anon public key |
| `RESEND_API_KEY` | API | Resend email API key |
| `RESEND_FROM_EMAIL` | API | Verified sender address |
| `AI_INTEGRATIONS_OPENROUTER_BASE_URL` | API | `https://openrouter.ai/api/v1` |
| `AI_INTEGRATIONS_OPENROUTER_API_KEY` | API | OpenRouter API key |
| `NOWPAYMENTS_API_KEY` | API | NowPayments API key |
| `NOWPAYMENTS_IPN_SECRET` | API | NowPayments IPN secret |
| `SESSION_SECRET` | API | Random string (`openssl rand -hex 32`) |
| `NODE_ENV` | API | `production` on Vercel |

---

## License

Private — PNG Website Builders © 2025
