c# Banking-UI — Angular frontend

Angular 22 UI for the Banking microservice, wired to the Banking API. Five screens from the
FNB Sim wireframes: **Dashboard**, **Create Account** (+ success), **Balance Enquiry** (with
All / Completed / Pending history tabs) and **Cards**.

## How it connects

- The app calls the backend under `/api/*`. In dev, `proxy.conf.json` forwards `/api` to
  `http://localhost:8081`, so there is **no CORS** to configure — the browser sees same-origin.
- Every request carries a **Bearer token** (an HTTP interceptor reads it from `environment.ts`).
  The backend validates it exactly like the `#218` flow (JWKS resource server).

## Screens → endpoints

| Screen | Calls |
|--------|-------|
| Dashboard | `GET /api/accounts/mine`, `GET /api/transactions/history` |
| Create Account | `POST /api/accounts` |
| Account Created | (uses the created account returned by the POST) |
| Balance Enquiry | `GET /api/accounts/mine`, `GET /api/balance/{accountNumber}`, `GET /api/transactions/history` |
| Cards | `GET /api/accounts/mine`, `GET /api/cards/by-account/{accountId}` |

> `GET /api/accounts/mine` and `POST /api/accounts` were added to `BankingController` for this UI.
> The **first/main** account is still created automatically at registration (Kafka); the
> Create Account button opens **additional** accounts.

## Prerequisites

1. Banking API running on `:8081` with the `local` profile (Postgres + Kafka up).
2. The local JWKS server running: `python -m http.server 9000` in the folder containing `jwks.json`.
3. Node 20+ / npm.

## One-time setup

1. Install dependencies **on this machine** (the checked-in `node_modules`, if any, may be from
   another OS — native binaries like esbuild are platform-specific):
   ```
   cd Banking-UI
   npm install
   ```
2. Open `src/environments/environment.ts` and paste your dev credentials:
   ```ts
   devToken: '<a ROLE_USER JWT>',   // minted on jwt.io, iss=banking-dev-jsp, signed by your local JWKS key
   customerId: '<the token sub>',   // the customer UUID; used only for display
   ```
   Mint the token the same way as the `#218` local tests: RS256, header `kid` matching
   `jwks.json`, claim `iss=banking-dev-jsp`, and `sub` = the customer's UUID.

   > Keep the committed `environment.ts` on the **placeholder** values — don't commit a real token.

## Run

```
npm start          # or: ng serve
```

Open `http://localhost:4200`. The dev server proxies `/api` to the backend automatically.

## Notes & known simplifications

- **Data visibility:** endpoints derive the customer from the JWT `sub`, so the UI shows only that
  customer's accounts/history. For history to show rows, that customer must have transactions in the
  last 5 days (the seed data belongs to other customers, so history may be empty — that's expected).
- **Balance Enquiry "Balance After"** column shows `—` (the backend `TransactionResponse` doesn't
  carry a running balance).
- **Cards → Freeze** is a client-side visual toggle only (no backend freeze endpoint yet). If an
  account has no linked card, the page falls back to showing any card so the screen is demonstrable.
- **Currency/amounts** are formatted client-side (`R` for ZAR).
