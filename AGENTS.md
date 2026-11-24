# ShopLedger

## Stack

- Node.js and CommonJS, with Express 4 and body-parser for JSON requests.
- Static HTML, CSS, and browser JavaScript in `public/`. The app stores data in `data/db.json`.
- `server.js` serves the UI, mounts the routers under `/api`, and renders printable invoices. `config.js` holds app settings and business rules.

## Module map

- `routes/customers.js` lists customers and records Khata settlements.
- `routes/orders.js` lists, retrieves, creates, and cancels orders.
- `routes/products.js` lists products and active coupons.
- `routes/reports.js` serves dashboard and GST reports, pricing previews, and an admin export.
- `lib/coupons.js` normalizes coupon codes, checks eligibility, and calculates discounts.
- `lib/dates.js` formats today's date, normalizes date keys, and determines fiscal years.
- `lib/inventory.js` looks up products, checks sellable stock, reserves and releases stock, and summarizes inventory.
- `lib/invoice.js` computes invoice figures using shared pricing and renders printable HTML.
- `lib/ledger.js` looks up customers and handles Khata charges, reversals, and settlements.
- `lib/orders.js` manages order records, cancellation, and filtering.
- `lib/pricing.js` calculates subtotal, discounts, line-item GST, and checkout totals.
- `lib/reports.js` summarizes the dashboard and reconciles invoice figures with recorded order totals.
- `lib/store.js` reads and writes the JSON store and appends audit events.
- `lib/tax.js` resolves item GST rates and splits GST into CGST and SGST.

## Commands

- Start the app with `npm start`. The default URL is `http://localhost:3000`.
- Run tests with `node --test`.

## Rules

1. Write characterization tests before changing behavior.
2. Change only the production modules covered by the ticket.
3. Use in-memory test data. Tests must never read or write `data/db.json`.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

- [Issue #1](https://github.com/JayanGupta/ShopLedger/issues/1) concerns invoice totals and GST breakdowns that differ from what the customer was billed.
- Allowed production files are `lib/invoice.js` and, only if necessary, `lib/tax.js`.
