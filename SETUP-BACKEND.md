# Supsperm backend setup (MySQL + M-Pesa Daraja)

1. Install MySQL 8 (or MariaDB 10.6+). Create the database and a user:
   CREATE DATABASE supsperm CHARACTER SET utf8mb4;
   CREATE USER 'supsperm'@'localhost' IDENTIFIED BY 'choose-a-password';
   GRANT ALL ON supsperm.* TO 'supsperm'@'localhost';
2. Copy `.env.example` to `.env.local` and set DATABASE_URL. For a first run keep `MPESA_MOCK=1` and set
   MPESA_CALLBACK_SECRET to any long random string and MPESA_CALLBACK_BASE_URL to https://example.invalid.
3. `npm install`, then `npm run db:migrate`, then `npm run db:seed`, then `npm run dev`.
4. Mock mode (dev server only; it is ignored by `npm run build && npm start`): "Pay with M-Pesa" succeeds after ~4 seconds with a fake receipt.

## Real Daraja sandbox
1. Create an app at https://developer.safaricom.co.ke, enable "Lipa Na M-Pesa Sandbox", copy the consumer key/secret and the test passkey.
2. Expose your dev server on public https (e.g. `ngrok http 3000`) and set MPESA_CALLBACK_BASE_URL to that URL.
3. Fill MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, MPESA_SHORTCODE=174379 and set MPESA_MOCK=0. Restart.
4. Use a sandbox test phone number from the Daraja simulator.

## Going live (not optional steps)
- Production needs your own paybill/till, Safaricom's go-live approval, and MPESA_ENV=production with production credentials.
- Run behind HTTPS. Keep `.env.local` out of git. Rotate MPESA_CALLBACK_SECRET if it ever leaks.
- Orders flagged `needs_review = 1` (late, duplicate, over- or under-payments) need a human to refund or reconcile.
- Replace the in-memory rate limiter (lib/server/util.ts) before running more than one server instance.
- Phone numbers, emails and names are stored unencrypted. Decide on encryption-at-rest, retention and backups under the Data Protection Act, 2019.

## Accounts (added in step 3)
- Run `npm run db:migrate` again: it applies a second migration (users, sessions, favorites; user_id on orders and bookings).
- Checkout, booking, the dashboard and donor photos now require login. Register at /register.
- Staff commands (run in the project folder):
  - `npm run user -- verify someone@example.com`   unlocks donor photos for that account (do this only after your identity checks)
  - `npm run user -- role someone@example.com CLINIC`   (or ADMIN) shows the clinic booking list on /dashboard
- Sessions are cookies valid for 14 days; they are marked Secure in production, so production needs HTTPS.
- Not built yet: email verification, password reset (a forgotten password needs a manual reset by staff for now), "log out everywhere", an audit log of who viewed what.
