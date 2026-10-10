# Supsperm

Web application for a donor sperm bank and fertility clinic based in Nairobi, Kenya: donor directory and profiles, vial reservation paid through M-Pesa, clinic (IUI/IVF) booking, and user accounts with a dashboard.

> **Status: working prototype.

## Tech stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **UI:** Tailwind CSS, Framer Motion, Lucide icons
- **State:** Zustand (client), TanStack Query provider (installed, lightly used)
- **Database:** MySQL 8 / MariaDB via Drizzle ORM and `mysql2`
- **Validation:** Zod
- **Payments:** Safaricom M-Pesa Daraja (STK Push)
- **Auth:** email + password, server-side sessions in MySQL (scrypt hashing, HttpOnly cookies)

Installed but not used yet: 

## What works

| Area | Status |
|---|---|
| Landing page, search bar, pricing section (USD or KES) | Built |
| Donor directory with filters, comparison drawer | Built (mock donor data) |
| Donor profile: tabs, audio player UI, favorites, reserve panel | Built (mock data, simulated audio) |
| Accounts: register, login, logout, dashboard | Built and tested over HTTP |
| Donor photos: server-side gate for verified accounts | Built (placeholder images) |
| Checkout: server-priced orders, stock reservation, M-Pesa STK Push | Built; tested in mock mode only |
| Clinic booking (IUI/IVF) with double-booking protection | Built, no payment, no email/SMS |
| Terms and conditions gate (donor / buyer) | Built; legal text is a draft |
| SEO basics: metadata, sitemap, robots, structured data, contact page with map | Built |
| Donor application wizard, delivery tracking map, secure messaging | **Not built** |
| Email and SMS (confirmations, verification, password reset) | **Not built** |

## Requirements

- Node.js 20 or newer
- MySQL 8 or MariaDB 10.6+ running locally
- Windows users: if PowerShell blocks npm, run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`. Keep the project **outside OneDrive** (for example `C:\dev\supsperm`); syncing breaks `node_modules`.

## Getting started

1. **Create the database and a user**

   ```sql
   CREATE DATABASE supsperm CHARACTER SET utf8mb4;
   CREATE USER 'supsperm'@'localhost' IDENTIFIED BY 'choose-a-password';
   GRANT ALL ON supsperm.* TO 'supsperm'@'localhost';
   ```

2. **Create your environment file** in the project root (beside `package.json`)

   ```
   copy .env.example .env.local
   ```

   Set `DATABASE_URL` (URL-encode special characters in the password, e.g. `@` as `%40`). For a first run keep `MPESA_MOCK=1`, set `MPESA_CALLBACK_SECRET` to any long random string, and `MPESA_CALLBACK_BASE_URL=https://example.invalid`.

3. **Install, migrate, seed, run**

   ```
   npm install
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

4. Open http://localhost:3000, register at `/register`, then use the staff commands below to verify your account.

### Mock payments

With `MPESA_MOCK=1`, "Pay with M-Pesa" succeeds after about 4 seconds with a fake receipt. Mock mode works only under `npm run dev` and is ignored in production builds, so fake payments cannot go live.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run db:generate` | Generate a migration after editing `db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Insert the mock donors (never overwrites live stock) |
| `npm run user -- verify <email>` | Mark an account verified (unlocks donor photos) |
| `npm run user -- role <email> <RECIPIENT\|CLINIC\|ADMIN>` | Change a user's role |

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `MPESA_ENV` | `sandbox` or `production` |
| `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET` | Daraja app credentials |
| `MPESA_SHORTCODE`, `MPESA_PASSKEY` | Paybill/till and Lipa Na M-Pesa passkey |
| `MPESA_TRANSACTION_TYPE` | `CustomerPayBillOnline` (paybill) or `CustomerBuyGoodsOnline` (till) |
| `MPESA_PARTY_B` | Till number for buy-goods; empty uses the shortcode |
| `MPESA_CALLBACK_BASE_URL` | Public HTTPS URL Safaricom can reach (e.g. an ngrok URL in development) |
| `MPESA_CALLBACK_SECRET` | Secret token appended to the callback URL |
| `MPESA_MOCK` | `1` for fake payments in development |

Never commit `.env.local`. It is listed in `.gitignore`.

## Real M-Pesa (Daraja sandbox)

1. Create an app at https://developer.safaricom.co.ke and enable the Lipa Na M-Pesa sandbox. Copy the consumer key, secret and test passkey.
2. Expose your dev server over HTTPS (`ngrok http 3000`) and set `MPESA_CALLBACK_BASE_URL` to that URL.
3. Fill in the `MPESA_*` variables, set `MPESA_MOCK=0`, and restart.
4. Use a sandbox test number from the Daraja simulator.

Going live requires your own paybill or till, Safaricom's go-live approval, `MPESA_ENV=production`, and HTTPS hosting. The Daraja request code follows Safaricom's documented format but **has not been run against Safaricom's servers**.

Payments safety rules built in: prices and the KES amount are computed on the server when the order is created (the rate is locked per order); stock is reserved atomically with a 15-minute hold; callbacks are token-protected and idempotent; underpayments never mark an order paid; late, duplicate and overpaid payments set `needs_review` on the order for manual reconciliation.

## Accounts and roles

- Register at `/register`. Checkout, booking, the dashboard and donor photos require login.
- **Verification** (staff-approved, unlocks donor photos) and **roles** are set with the `npm run user` commands above. Decide and document your identity-check process before verifying anyone.
- `CLINIC` and `ADMIN` accounts see upcoming bookings (including contact details) on `/dashboard`. `ADMIN` can read any order.

## Project structure

```
app/                  Pages and API routes (App Router)
  api/                orders, pay (stk + callback), bookings, auth, favorites, donors/[id]/photo
  donors/ [id]/       Directory and profile pages
  dashboard/ book/ checkout/ login/ register/ contact/ terms/ become-a-donor/
components/           UI components (DonorCard, FilterPanel, ReservePanel, BookingWizard, ...)
db/                   Drizzle schema, connection, seed script
drizzle/              Generated SQL migrations
lib/                  Config and shared logic
  pricing.ts          Prices, tiers, clinic fees, USD to KES rate
  site.ts             Address, phone, email, hours
  terms.ts            Terms and conditions text and version
  booking.ts          Clinic hours and slot rules
  donors.ts           MOCK donor data
  server/             Server-only code: auth, M-Pesa client, orders, payments
store/                Zustand stores (filters, cart, currency, auth, booking)
scripts/user.ts       Staff command-line tool
```

## Things you must edit before launch

| File | What to replace |
|---|---|
| `lib/pricing.ts` | Vial prices per tier, clinic fees, donor fee text, `USD_TO_KES` (placeholder rate), then set `PRICES_CONFIRMED = true` |
| `lib/site.ts` | Street address, phone, email, opening hours, facility licence line |
| `lib/terms.ts` | Terms text. Resolve every `[bracketed]` item with a Kenyan lawyer and bump `TERMS_VERSION` |
| `lib/booking.ts` | Real clinic hours |
| `lib/donors.ts` | Mock donors; replace with data from the database |





## License

No license has been chosen. Until one is added, all rights are reserved by the repository owner.
