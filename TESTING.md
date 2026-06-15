# Testing Guide — `feature/india-expansion`

This branch adds 7 new features to the finance SaaS platform. Most features can be tested immediately after running the DB migration. Two features require free external API credentials.

---

## Prerequisites

### 1. Run DB migration

New tables and columns are added in this branch. Run this once before testing anything:

```bash
bun run db:generate
bun run db:migrate
```

**What gets created:**
- New table: `transaction_splits`
- New table: `spending_alerts`
- New table: `setu_connected_banks`
- New columns on `transactions`: `receipt_url`, `upi_ref`, `tax_category`, `currency`
- New column on `accounts`: `currency`

### 2. Start the dev server

```bash
bun dev
```

---

## Features & How to Test

---

### 1. Export Transactions to PDF / Excel

**Setup required:** None

**How to test:**
1. Go to `/transactions`
2. Make sure you have at least a few transactions (add manually or via CSV import)
3. Click the **Export** button in the top-right of the transactions card
4. Select **Export as Excel (.xlsx)** — file downloads immediately
5. Select **Export as PDF** — landscape PDF with styled table downloads

**Expected output:**
- Excel file: `transactions_YYYY-MM-DD.xlsx` with Date, Payee, Amount, Category, Account, Notes columns
- PDF file: `transactions_YYYY-MM-DD.pdf` with blue header row and alternating row colours
- Export button is disabled when there are no transactions

---

### 2. INR Formatting (Indian Number System)

**Setup required:** None

**How to test:**
- All monetary values across the dashboard now display in Indian number format
- Example: `₹1,23,456.78` instead of `₹123,456.78`
- This is automatic — no action needed, just observe the dashboard summary cards and transaction amounts

---

### 3. UPI Reference on Transactions

**Setup required:** None

**How to test:**
1. Go to `/transactions` → click **Add new**
2. Scroll to the **UPI Reference** field
3. Enter a UPI ref (e.g. `UPI/123456789012` or `HDFC0012345@upi`)
4. Save the transaction
5. Open the transaction again in Edit mode — the UPI ref should persist

---

### 4. Tax Categorisation

**Setup required:** None

**How to test:**
1. Open any transaction form (new or edit)
2. Find the **Tax Category** dropdown — options are:
   - 80C – Investments (PPF, ELSS, LIC)
   - 80D – Health Insurance
   - HRA – House Rent
   - Business Expense
   - Other Deductible
3. Select a category and save
4. Reopen the transaction — the selection should be preserved
5. Transactions tagged this way are stored in `tax_category` column for future tax summary reports

---

### 5. Receipt Image Upload

**Setup required:** Free UploadThing account

**One-time setup:**
1. Sign up at [uploadthing.com](https://uploadthing.com/dashboard)
2. Create a new app
3. Copy the **App Token** from the dashboard
4. Add to `.env.local`:
   ```
   UPLOADTHING_TOKEN=your_token_here
   ```
5. Restart the dev server

**How to test:**
1. Open any transaction form
2. Find the **Receipt** section — shows a dashed upload area
3. Click it and select a `.jpg`, `.png`, or `.webp` image (max 4MB)
4. Wait for "Uploading..." → changes to **View receipt** link
5. Save the transaction
6. Reopen — the receipt link should still be there and open the uploaded image in a new tab

---

### 6. Transaction Split

**Setup required:** None

**How to test:**
1. Open a new transaction form
2. Enter an amount (e.g. `1000`)
3. Click **Split transaction** — two split rows appear
4. For each row, select a category and enter a partial amount (e.g. `600` and `400`)
5. The badge shows unallocated amount — should read `₹0.00` when fully allocated
6. Add more rows with **+ Add split** if needed
7. Save the transaction
8. The splits are written to the `transaction_splits` table

**Edge cases to test:**
- Save with split amounts that don't add up — badge shows red "₹X.XX unallocated" as a visual warning (no hard block, by design)
- Click **Remove split** to go back to single-category mode

---

### 7. Spending Alerts

**Setup required:** None

**How to test:**

**Creating an alert:**
1. Go to `/settings`
2. Scroll to the **Spending Alerts** section at the bottom
3. Click **Add alert**
4. Fill in:
   - Name: `Food Budget`
   - Threshold: `5000` (₹5,000)
   - Period: `Monthly`
   - Category: Select a category (or leave blank for all)
5. Click **Save alert** — appears in the list

**Triggering the alert:**
1. Add transactions in that category totalling more than ₹5,000 for the current month
2. Reload the dashboard (`/`)
3. A **toast warning** fires at the top-right:
   > ⚠️ Alert: "Food Budget" — spent ₹6,200 of ₹5,000 limit

**Managing alerts:**
- Alerts list shows name, threshold, and period
- Click the red trash icon to delete an alert

---

### 8. Indian Bank Integration via Setu AA

**Setup required:** Setu sandbox credentials

**One-time setup:**
1. Register at [docs.setu.co](https://docs.setu.co/data/account-aggregator/quickstart)
2. Create a sandbox app and get your `client_id` and `client_secret`
3. Add to `.env.local`:
   ```
   SETU_CLIENT_ID=your_client_id
   SETU_CLIENT_SECRET=your_client_secret
   SETU_ENV=sandbox
   ```
4. Restart the dev server

**Alternative: Finvu sandbox** (if Setu registration is unavailable)
- Email `support@cookiejar.co.in` requesting a sandbox `client_api_key`
- Docs: https://finvu.github.io/sandbox/

**How to test:**
1. Go to `/settings`
2. Find the **Indian Bank (via Setu AA)** row
3. Click **Connect** — redirects to Setu's consent approval page
4. In sandbox mode, approve the consent with test credentials
5. Redirected back to `/setu-callback` — shows "Completing your bank connection..."
6. On success, redirected to `/settings` — row now shows **Connected** with a **Disconnect** button
7. Go to `/transactions` — bank transactions are auto-imported with UPI refs auto-populated

---

## Environment Variables Summary

| Variable | Required for | Where to get |
|---|---|---|
| `UPLOADTHING_TOKEN` | Receipt upload | [uploadthing.com/dashboard](https://uploadthing.com/dashboard) |
| `SETU_CLIENT_ID` | Indian bank sync | [docs.setu.co](https://docs.setu.co) |
| `SETU_CLIENT_SECRET` | Indian bank sync | [docs.setu.co](https://docs.setu.co) |
| `SETU_ENV` | Indian bank sync | Set to `sandbox` for testing |

All other features work without any additional credentials.

---

## New API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/setu/connected-bank` | Check Setu connection status |
| `POST` | `/api/setu/create-consent` | Start Indian bank connection flow |
| `POST` | `/api/setu/callback` | Setu redirects here after user approves |
| `POST` | `/api/setu/fetch-data` | Sync FI data after consent approval |
| `DELETE` | `/api/setu/connected-bank` | Disconnect Indian bank |
| `GET` | `/api/spending-alerts` | List all alerts for user |
| `POST` | `/api/spending-alerts` | Create a new alert |
| `PATCH` | `/api/spending-alerts/:id` | Update an alert |
| `DELETE` | `/api/spending-alerts/:id` | Delete an alert |
| `GET` | `/api/spending-alerts/check` | Check which alerts are currently triggered |
| `GET` | `/api/transaction-splits/:transactionId` | Get splits for a transaction |
| `POST` | `/api/transaction-splits/:transactionId` | Save splits for a transaction |
