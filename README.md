# TradeCadet

TradeCadet Journal is a production-style authenticated trading checklist, journal, history, and dashboard web app. It helps traders validate a setup before entry using weighted confluence rules across multiple timeframes, then save the setup and review the resulting performance over time.

Record. Review. Refine.

This application is a checklist and journaling system only. It does not place trades and does not connect to brokers, exchanges, wallets, or live market APIs.

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS v4, Axios, Lucide React, Recharts
- Backend: Node.js, Express.js, Prisma ORM, PostgreSQL, JWT with HTTP-only cookies, bcrypt, cookie-parser, cors, dotenv, zod

## Features

- User registration, login, logout, and current-session lookup
- Protected routes with redirect behavior for authenticated and unauthenticated users
- Weighted checklist engine with section scoring, total confluence, and setup quality classification
- Required Stop Loss and Take Profit confirmations before saving a trade
- Trade journal form with optional metadata such as symbol, prices, notes, and emotional state
- Trade history with search and filter controls
- Trade detail page with checklist snapshot and outcome updates
- Dashboard with performance stats, P&L trend chart, and calendar markers
- SaaS-ready Free vs Pro monthly plan with a 25-trade free cap and Paystack billing endpoints
- Consistent JSON API responses and scoped per-user data access

## Folder Structure

```text
tradecadet/
  client/
    src/
      components/
      context/
      data/
      hooks/
      layouts/
      pages/
      services/
      styles/
      utils/
  server/
    prisma/
    src/
      controllers/
      middleware/
      prisma/
      routes/
      services/
      utils/
      validators/
  README.md
```

## Environment Variables

### `server/.env`

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/perfect_trade"
JWT_SECRET="change_this_secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
PORT=5000
NODE_ENV="development"
PAYSTACK_SECRET_KEY="sk_test_xxxxx"
PAYSTACK_PRO_PLAN_CODE="PLN_xxxxx"
```

### `client/.env`

```env
VITE_API_URL="http://localhost:5000/api"
```

## Installation

1. Install root, client, and server dependencies from the project root:

```bash
npm install
```

2. Copy environment files:

```bash
copy server\.env.example server\.env
copy client\.env.example client\.env
```

3. Update `server/.env` with your PostgreSQL credentials and JWT secret.

## Prisma Migration Instructions

1. Generate the Prisma client:

```bash
npm run prisma:generate
```

2. Create and apply the first migration:

```bash
npm run prisma:migrate -- --name init
```

If your shell does not forward the extra migration name argument through the root script cleanly, run the same command inside `server/`.

## Running the Server

```bash
npm run dev:server
```

The API will start on `http://localhost:5000`.

## Running the Client

```bash
npm run dev:client
```

The frontend will start on `http://localhost:5173`.

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`

### Trades

- `POST /api/trades`
- `GET /api/trades`
- `GET /api/trades/:id`
- `PATCH /api/trades/:id`
- `DELETE /api/trades/:id`

### Dashboard

- `GET /api/dashboard/stats`

### Billing

- `POST /api/billing/create-checkout-session`
- `POST /api/billing/create-customer-portal-session`
- `POST /api/billing/webhook`

Billing is currently designed for Paystack-hosted subscription checkout and subscription management.

## Trade Checklist Rules

The frontend uses a single source of truth in `client/src/data/checklistRules.js`. The confluence scoring utilities live in `client/src/utils/calculateConfluence.js`.

Setup quality bands:

- `0-39`: Weak Setup
- `40-69`: Moderate Setup
- `70-84`: Strong Setup
- `85-100`: Elite Setup

## Notes on Authentication

- JWTs are stored in an HTTP-only cookie named `perfect_trade_token`
- The cookie uses `sameSite=lax` in development and `sameSite=none` plus `secure=true` in production
- The frontend never stores the token in local storage
- All trade and dashboard endpoints are scoped to the authenticated `req.user.id`

## Future Improvements

- Real email-based password reset flow
- Pagination and server-side filters for trade history
- Advanced charting for outcome by symbol, setup quality, and session
- Export journal data to CSV or PDF
- Tagging, screenshots, and richer pre-trade/post-trade review workflows
- Team plans, annual billing, and richer Pro-tier feature segmentation
