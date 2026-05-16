# TradeCadet Launch Checklist

This file tracks what is already built, what should be finished before first real users, and what belongs to the next product phase.

Whenever we complete one of the pending items below, we should change its checkbox from `[ ]` to `[x]`.

## Core MVP Status

### Product and UX
- [x] TradeCadet rebrand applied across product-facing UI
- [x] Public landing page at `/`
- [x] Auth flow with login, register, forgot password, and reset password
- [x] Mobile-responsive app shell with top nav, drawer, and bottom nav
- [x] Profile page
- [x] Free vs Pro plan structure in the app

### Trade journaling
- [x] Strategy-based checklist journaling
- [x] Trend / Swing / Scalping strategy presets
- [x] Confluence scoring
- [x] Planned risk/reward calculation
- [x] Popular pair selection with custom symbol fallback
- [x] Manual trade entry
- [x] Post-trade outcome recording
- [x] Closed-trade correction flow
- [x] Structured pre/post-trade emotions
- [x] Mistake tags
- [x] Discipline score

### Reviews and analytics
- [x] Dashboard
- [x] Trading calendar with day drilldown
- [x] Weekly review
- [x] Strategy performance review
- [x] Rule impact analysis

### Evidence and imports
- [x] Screenshot upload
- [x] TradingView link support
- [x] Generic CSV import
- [x] MT4/MT5 statement import
- [x] Imported-trade source labeling and honest no-checklist behavior

## Recommended Before First Real Users

These are the main things still worth finishing before calling the product ready for real external use.

- [ ] Switch Paystack from test mode to live mode
- [ ] Add real `PAYSTACK_SECRET_KEY`
- [ ] Add real `PAYSTACK_PRO_PLAN_CODE`
- [ ] Configure live Paystack webhook to `/api/billing/webhook`
- [ ] Run one full end-to-end paid subscription test
- [ ] Replace development-style password reset with real email delivery
  - SMTP-based reset email sending is implemented in code
  - remaining work is adding real SMTP credentials and verifying delivery end to end
- [ ] Test imports with real files from multiple sources
- [ ] Smoke-test the main user flows end to end:
  - landing page
  - register/login/logout
  - create trade
  - close/correct trade
  - weekly review
  - strategy review
  - rule impact
  - screenshot upload
  - CSV import
  - upgrade flow

## Planned Next Phase

These are valuable next additions, but they are not required for the current MVP to exist.

- [ ] Binance CSV import
- [ ] Bybit CSV import
- [ ] Broader MT4/MT5 import support for more real-world statement variations
- [ ] Retro review flow for imported trades
- [ ] Export journal/report data to CSV
- [ ] Export journal/report data to PDF
- [ ] AI trade review

## Technical Polish Still Worth Doing

These are not core missing features, but they would improve launch quality and maintainability.

- [ ] Add stronger automated testing coverage
- [ ] Optimize bundle size with route-level code splitting
- [ ] Add clearer Pro gating consistency across all premium surfaces
- [ ] Add audit/history tracking for corrected trades

## Current Launch Readiness

### Safe to say is already true
- [x] The app is a real usable MVP
- [x] The app already supports manual journaling, review, analytics, and imports
- [x] The app can be tested with real users in a controlled way

### Still missing before a cleaner public launch
- [ ] Live payments
- [ ] Production-grade password reset email delivery
- [ ] Real-world import validation across more sample files
