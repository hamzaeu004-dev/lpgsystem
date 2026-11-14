# Binsuleman LPG ERP — Backend API Specification

This document describes the REST API the React frontend needs. Today every module saves its data in the browser (`localStorage`). The backend replaces that storage with a real database, so data is shared between users, devices and outlets.

Everything here is taken from the current frontend code: the forms, the fields they save, and the side effects each action has on other modules. Where the frontend does something that should not be copied as-is (plain-text passwords, IDs built from array length), the spec says so under **Backend rule**.

---

## Contents

1. [Conventions](#1-conventions)
2. [Roles and permissions](#2-roles-and-permissions)
3. [Auth and users](#3-auth-and-users)
4. [Shops / outlets](#4-shops--outlets)
5. [Customers](#5-customers)
6. [Cylinders (inventory and logistics)](#6-cylinders-inventory-and-logistics)
7. [Sales and refill billing](#7-sales-and-refill-billing)
8. [Purchase (parent module) and LPG purchase](#8-purchase-parent-module-and-lpg-purchase)
9. [Suppliers](#9-suppliers)
10. [Expenses](#10-expenses)
11. [Committee collection (separate module)](#11-committee-collection-separate-module)
12. [Owner personal ledger (separate module)](#12-owner-personal-ledger-separate-module)
13. [Dashboard and reports](#13-dashboard-and-reports)
14. [Settings](#14-settings)
15. [Database schema summary](#15-database-schema-summary)
16. [localStorage → API migration map](#16-localstorage--api-migration-map)
17. [Open decisions](#17-open-decisions)
18. [Suggested build order](#18-suggested-build-order)

---

## 1. Conventions

### Base URL

The frontend already has an axios client in `src/api/axiosConfig.js`:

```
REACT_APP_API_URL   (default: http://localhost:5000/api)
```

All paths below are relative to `/api`.

### Auth header

The axios client sends `Authorization: Bearer <token>`, reading the token from `localStorage.token`. Login must return a JWT that the frontend stores under that key.

### Response shape

The axios interceptor returns `response.data` directly and shows `error.response.data.message` in a toast. Use this envelope everywhere:

**Success**

```json
{
  "success": true,
  "data": { },
  "message": "Invoice INV-2026-001 created"
}
```

**List with pagination**

```json
{
  "success": true,
  "data": [ ],
  "meta": { "page": 1, "limit": 25, "total": 132 }
}
```

**Error** (4xx / 5xx)

```json
{
  "success": false,
  "message": "Customer name and phone number are required",
  "errors": { "phone": "Required" }
}
```

`message` must always be a human-readable sentence, because the frontend shows it as-is.

### Common query parameters for list endpoints

| Param | Example | Meaning |
|---|---|---|
| `page` | `1` | Page number, starting at 1 |
| `limit` | `25` | Page size (max 100) |
| `search` | `ali` | Free-text search (fields listed per endpoint) |
| `from`, `to` | `2026-11-01` | Date range, inclusive, `YYYY-MM-DD` |
| `shopId` | `12` | Filter by outlet |
| `sort` | `-date` | Field name, `-` prefix for descending |

### Data types

| Kind | Format |
|---|---|
| Money | Integer rupees (PKR). The UI never uses paisa. Store as `BIGINT` or `DECIMAL(14,2)`. |
| Weight | Decimal kg, e.g. `11.8`, `15.0`, `45.4` |
| Date only | `YYYY-MM-DD` (purchase date, committee date) |
| Date-time | ISO 8601 UTC, e.g. `2026-11-13T09:15:00Z` (sales, expenses) |
| IDs | Numeric or UUID primary key `id`, plus a human code where the UI shows one (see below) |

### Human-readable codes

The UI shows codes such as `INV-2026-005`, `CUST-001`, `CYL-2026-101`, `EXP-2026-003`, `INV-PUR-501`, `COM-1001`. The frontend currently builds these from the array length, which creates duplicates after a delete.

**Backend rule:** keep a numeric/UUID primary key, and generate the code server-side from a per-type sequence (`code` column, unique). Sales invoice numbers are an exception: the UI lets the cashier type a custom invoice number, so accept `invoiceNo` from the client, check it is unique, and generate one only when it is empty.

### Transactions

Several actions change more than one table (a sale changes the sale, the cylinder, and the customer balance). Each such endpoint must run in **one database transaction**, so a failure leaves nothing half-saved. These are marked **Side effects** below.

---

## 2. Roles and permissions

Roles used in Settings → Users: `Super Admin`, `Manager`, `Cashier`, `Operator`. Each user also has an `outlet` (one shop, or "All Outlets & Depots").

Suggested permission matrix (confirm with the owner):

| Module | Super Admin | Manager | Cashier | Operator |
|---|---|---|---|---|
| Dashboard / Reports | All outlets | Own outlet | Own outlet, read | — |
| Sales | Full | Full (own outlet) | Create, receive payment, receive empty | Read |
| Purchase | Full | Full (own outlet) | Read | Read |
| Expenses | Full | Full (own outlet) | Create | — |
| Customers | Full | Full | Create, edit | Read |
| Cylinders | Full | Full (own outlet) | Read | Register empty, refill, transfer |
| Shops | Full | Read | Read | Read |
| Committee & owner ledger | Full | — | — | — |
| Settings, users | Full | — | — | — |

**Backend rule:** enforce permissions on the server. The frontend hides buttons but must not be the only check. Users limited to one outlet only see and change that outlet's records.

---

## 3. Auth and users

### Model: `User`

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `code` | string | `USR-001` |
| `name` | string | Required |
| `username` | string | Required, unique, lower-case |
| `email` | string | Unique. Default `<username>@binsuleman.com` if empty |
| `passwordHash` | string | **Never return in any response** |
| `role` | enum | `Super Admin`, `Manager`, `Cashier`, `Operator` |
| `shopId` | FK → Shop, nullable | `null` = all outlets |
| `phone` | string | |
| `status` | enum | `Active`, `Inactive` |
| `isSuperAdmin` | boolean | `true` for the primary owner account |
| `createdAt` | date-time | |

**Backend rule:** the frontend stores plain-text passwords in `authHelper.js`. Store a bcrypt/argon2 hash instead.

### Endpoints

| Method | Path | Who | Purpose |
|---|---|---|---|
| POST | `/auth/login` | Public | Log in with username **or** email + password |
| POST | `/auth/logout` | Logged in | Invalidate the token (optional if using short-lived JWT) |
| GET | `/auth/me` | Logged in | Current user (header shows name + role) |
| GET | `/users` | Super Admin | List users |
| POST | `/users` | Super Admin | Create user |
| PATCH | `/users/:id/status` | Super Admin | Toggle `Active` / `Inactive` |
| PATCH | `/users/:id/password` | Super Admin | Reset password |

**POST `/auth/login`**

```json
// request
{ "username": "admin", "password": "admin123" }

// response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": 1, "code": "USR-001", "name": "Ali Ahmed", "role": "Super Admin", "shopId": null, "isSuperAdmin": true }
  }
}
```

Rules (from `authenticateUser`):

- Match `username` case-insensitively against `username` **or** `email`.
- Wrong credentials → `401` "Invalid Username / Email or Password!"
- `status = Inactive` → `403` "Your account has been deactivated by Super Admin!"

**POST `/users`** — body: `name`, `username`, `email?`, `password`, `role`, `shopId?`, `phone?`.
Duplicate username → `409` `Username "x" already exists!`. `isSuperAdmin` is set when role is `Super Admin`.

**PATCH `/users/:id/status`** — the primary Super Admin cannot be deactivated → `400` "Cannot deactivate primary Super Admin account!"

---

## 4. Shops / outlets

### Model: `Shop`

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `code` | string | `SHOP-001` |
| `name` | string | Required. e.g. "Main Central Depot" |
| `location` | string | Required |
| `manager` | string | Default "Unassigned" |
| `phone` | string | |
| `status` | enum | `Active`, `Inactive` |
| `createdAt` | date-time | |

The frontend also shows `totalCylinders`, `inStock`, `dispatched`, `refillPending` and `monthlyRevenue` per shop. **Backend rule:** do not store these; calculate them from cylinders and sales (see `GET /shops/:id/stats`).

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/shops` | List (search: name, location, manager) |
| GET | `/shops/:id` | One shop |
| POST | `/shops` | Create |
| PUT | `/shops/:id` | Update |
| DELETE | `/shops/:id` | Delete (block if it has cylinders or sales; prefer `status = Inactive`) |
| GET | `/shops/:id/stats` | `{ totalCylinders, inStock, withCustomers, refillPending, monthlyRevenue }` |

---

## 5. Customers

### Model: `Customer`

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `code` | string | `CUST-001` |
| `name` | string | Required |
| `phone` | string | Required |
| `cnic` | string | Format `00000-0000000-0` |
| `address` | string | |
| `category` | enum | `Domestic`, `Commercial` (shown as "Commercial (Hotel/Bakery)"; default `Domestic`) |
| `securityDeposit` | money | Default 4500 (from Settings → rates) |
| `balance` | money | Outstanding baqaya. **Derived** — see rule |
| `status` | enum | `Active`, `Inactive` |
| `createdAt` | date | |

The frontend keeps `assignedCylinders[]` and `activeCylindersCount` on the customer. **Backend rule:** derive both from `cylinders.customer_id`, and derive `balance` as `SUM(sales.remaining_balance)` for the customer. Storing them separately is how they drift out of sync.

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/customers` | List (search: name, phone, cnic, address) |
| GET | `/customers/:id` | Detail incl. assigned cylinders and open invoices |
| POST | `/customers` | Create |
| PUT | `/customers/:id` | Update |
| DELETE | `/customers/:id` | Delete (block if cylinders assigned or baqaya > 0) |
| POST | `/customers/:id/return` | Customer returns a cylinder (already stubbed in `customerAPI.js`) |

**POST `/customers`**

```json
{ "name": "Ali Raza", "phone": "0300-1234567", "cnic": "37405-1234567-1", "address": "G-9, Islamabad", "category": "Domestic", "securityDeposit": 4500 }
```

Validation: name and phone required → "Customer name and phone number are required!"

---

## 6. Cylinders (inventory and logistics)

### Model: `Cylinder`

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `code` | string | `CYL-2026-101` |
| `serialNo` | string | Registration / tag no., e.g. `REG-LPG-11801`. **Unique** |
| `type` | enum | `Domestic 11.8 kg`, `Commercial 15.0 kg`, `Commercial 45.4 kg` |
| `weightKg` | decimal | 11.8 / 15.0 / 45.4 |
| `tareWeightKg` | decimal | Empty weight |
| `shopId` | FK → Shop | Current location |
| `status` | enum | see below |
| `customerId` | FK → Customer, nullable | Set when `status = customer` |
| `depositPkr` | money | 4500 for ≤ 20 kg, 15000 above (Settings → rates) |
| `lastRefillDate` | date | |
| `returnDate` | date | Expected/actual return |
| `updatedAt` | date-time | |

**Status values** (from `inventorySlice` and `constants.js`):

| Value | Meaning in UI |
|---|---|
| `stock` | Filled, in stock, ready to sell |
| `customer` | Issued to a customer |
| `refill` | Empty, waiting for refill |
| `market` | Out at plant / in market for refill |

Status flow:

```
refill (empty) ──refill done──▶ stock ──sold──▶ customer ──empty returned──▶ refill
```

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/cylinders` | List. Filters: `status`, `shopId`, `type`, `search` (serialNo) |
| GET | `/cylinders/summary` | Counts by status, by shop and by type (Dashboard fleet donut, Cylinders page cards) |
| POST | `/cylinders` | Register a cylinder (Cylinders → "Log empty cylinder") |
| PATCH | `/cylinders/:id/status` | Change status (already stubbed as `PUT /inventory/:id/status`) |
| POST | `/cylinders/:id/refill` | Mark refilled: `refill` → `stock`, sets `lastRefillDate` |
| POST | `/cylinders/:id/transfer` | Move to another shop: body `{ "targetShopId": 3 }` |
| DELETE | `/cylinders/:id` | Delete (only if not with a customer) |

**POST `/cylinders`** (register empty)

```json
{ "serialNo": "REG-LPG-11809", "type": "Domestic 11.8 kg", "weightKg": 11.8, "tareWeightKg": 13.5, "shopId": 1, "returnDate": "2026-11-13" }
```

New cylinders start as `status = refill`. Duplicate `serialNo` → `409`.

**Backend rule:** keep a `cylinder_movements` history table (who changed what, from which status/shop to which, when). The UI does not show it yet, but it is the only way to answer "where was this cylinder last week?".

The frontend's `inventoryAPI.js` uses `/inventory/...`. Either rename those calls to `/cylinders` or alias the routes.

---

## 7. Sales and refill billing

A sale issues a filled cylinder to a customer, optionally takes back an empty one, and records the bill, the amount paid now, and the remaining baqaya.

### Model: `Sale`

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `invoiceNo` | string | Unique. Typed by cashier or generated (`INV-2026-005`) |
| `date` | date-time | |
| `shopId` | FK → Shop | |
| `customerId` | FK → Customer, nullable | `null` for walk-in |
| `customerName` | string | Snapshot of the name (walk-in name when no customer) |
| `customerPhone` | string | Walk-in only |
| `issuedCylinderId` | FK → Cylinder, nullable | When chosen from stock |
| `issuedCylinderRegNo` | string | Snapshot; also used for custom/unlisted cylinders |
| `issuedCylinderType` | string | e.g. `Domestic 11.8 kg` |
| `emptyReturned` | boolean | Empty received with this sale or later |
| `returnedCylinderRegNo` | string, nullable | |
| `totalBill` | money | Refill amount |
| `paidAmount` | money | Running total of payments |
| `remainingBalance` | money | `max(0, totalBill − paidAmount)` — **computed on server** |
| `securityDeposit` | money | Deposit held for a registered customer (0 for walk-in) |
| `paymentMethod` | enum | `Cash`, `Online Bank Transfer`, `JazzCash / EasyPaisa`, `Customer Ledger Credit` |
| `status` | enum | `Completed` or `Pending` — **computed**: `Completed` when `emptyReturned && remainingBalance = 0` |
| `createdBy` | FK → User | |

Also add a `sale_payments` table (`saleId`, `amount`, `method`, `date`, `receivedBy`) so each baqaya payment is recorded separately rather than only summed.

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/sales` | List. Filters: `status` (`pending_empty`, `pending_baqaya`, `completed`), `registeredOnly=true`, `shopId`, `from`, `to`, `search` (invoiceNo, customerName, issued/returned reg no) |
| GET | `/sales/:id` | One sale with payments (receipt) |
| POST | `/sales` | Create sale |
| PUT | `/sales/:id` | Edit sale |
| POST | `/sales/:id/payments` | Receive baqaya payment |
| POST | `/sales/:id/return-empty` | Receive pending empty cylinder |
| DELETE | `/sales/:id` | Delete (Super Admin only; reverse side effects) |
| GET | `/sales/stats` | Cards on the Sales page (already stubbed in `salesAPI.js`) |

**POST `/sales`**

```json
{
  "invoiceNo": "INV-2026-005",
  "shopId": 1,
  "customerId": 7,
  "walkIn": null,
  "issuedCylinderId": 102,
  "customIssuedCylinder": null,
  "hasReturnedEmpty": true,
  "returnedCylinderRegNo": "REG-LPG-11801",
  "totalBill": 2850,
  "paidAmount": 2000,
  "paymentMethod": "Cash"
}
```

For a walk-in customer send `customerId: null` and `"walkIn": { "name": "Ali", "phone": "0300-..." }`.
For a cylinder that is not in the system send `issuedCylinderId: null` and `"customIssuedCylinder": { "regNo": "LPG-PK-11805", "type": "Domestic 11.8 kg" }`.

Validation:

- `invoiceNo` empty → generate; duplicate → `409` "Invoice number already exists".
- Registered mode without `customerId` → "Please select a registered customer!"
- Walk-in without name → "Please enter Custom Customer Name!"
- Custom cylinder without reg no → "Please enter Custom Cylinder Reg No / Tag!"
- `issuedCylinderId` must have `status = stock`.

**Side effects (one transaction)** — from `handleSaleSubmit`:

1. Insert the sale; `remainingBalance = max(0, totalBill − paidAmount)`.
2. If `paidAmount > 0`, insert a `sale_payments` row.
3. If the issued cylinder is from stock: set it to `status = customer`, `customerId`.
4. If an empty was returned and its reg no matches a cylinder: set that cylinder to `status = refill`, `customerId = null`.
5. `securityDeposit` = the customer's deposit (0 for walk-in).

Response: the created sale (the frontend opens the receipt from it).

**PUT `/sales/:id`** — editable fields: `invoiceNo`, `customerName`, `issuedCylinderRegNo`, `returnedCylinderRegNo`, `totalBill`, `paidAmount`, `paymentMethod`. Recompute `remainingBalance` and `status`.

**POST `/sales/:id/payments`**

```json
{ "amount": 850, "method": "Cash" }
```

Amount must be > 0 → "Please enter a valid payment amount!". Must not exceed `remainingBalance`. Adds to `paidAmount`, recomputes balance and status.

**POST `/sales/:id/return-empty`**

```json
{ "returnedCylinderRegNo": "REG-LPG-11801" }
```

Sets `emptyReturned = true`; if the reg no matches a cylinder, sets it to `refill` and clears its customer. Recomputes status.

**GET `/sales/stats`** → `{ totalRegisteredSales, pendingEmptyCount, totalOutstandingBaqaya, totalSecurityDepositsHeld }` (filters: `shopId`, `from`, `to`).

---

## 8. Purchase (parent module) and LPG purchase

Purchase is a **parent module**. Each purchase type is a sub-page: today only **LPG Purchase** exists (`/purchase/lpg`); more types will follow. On the frontend the list lives in `src/config/purchaseCategories.js`.

**Backend rule:** design for several categories now so adding one later needs no schema change.

### Model: `PurchaseCategory`

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `slug` | string | `lpg` (matches the frontend config `id`) |
| `name` | string | `LPG Purchase` |
| `isActive` | boolean | |

### Model: `Purchase` (invoice header)

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `code` | string | `INV-PUR-501` |
| `categoryId` | FK → PurchaseCategory | `lpg` today |
| `date` | date | |
| `shopId` | FK → Shop | The frontend uses free text `branch` (`Branch 1`, `Main Branch`) — see [open decisions](#17-open-decisions) |
| `supplierId` | FK → Supplier | The frontend stores `supplierName` only — store the FK |
| `totalQty` | int | Sum of items — **computed** |
| `totalWeight` | decimal | Sum of items — **computed** |
| `totalAmount` | money | Sum of items — **computed** |
| `paymentStatus` | enum | `Paid`, `Pending Credit` |
| `paymentMode` | string | The form has no selector yet and always sends `Bank Transfer`; accept `Cash`, `Bank Transfer`, `Cheque` |
| `notes` | string | Default "Cylinder stock purchase" |
| `createdBy` | FK → User | |

### Model: `PurchaseItem` (LPG line)

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `purchaseId` | FK → Purchase | |
| `size` | enum | `11 kg`, `15 kg`, `45 kg` |
| `regNo` | enum/string | `20`, `22` |
| `qty` | int | > 0 |
| `unitPrice` | money | Default 2900 in the form |
| `lineWeight` | decimal | `qty × size kg` — computed |
| `lineTotal` | money | `qty × unitPrice` — computed |

For future categories, add a generic `itemName` / `productId` column to `PurchaseItem` (nullable for LPG) instead of a new table.

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/purchase-categories` | List categories (lets the sidebar be driven by the API later) |
| GET | `/purchases?category=lpg` | List invoices. Filters: `shopId`, `from`, `to`, `search` (code, supplier, item size/reg no) |
| GET | `/purchases/:id` | Invoice with items (Bill view) |
| POST | `/purchases` | Create invoice |
| PUT | `/purchases/:id` | Edit invoice (replace items) |
| DELETE | `/purchases/:id` | Delete |
| GET | `/purchases/stock-breakdown?category=lpg&shopId=` | Quantity and weight by size × reg no |

**POST `/purchases`**

```json
{
  "category": "lpg",
  "date": "2026-11-13",
  "shopId": 1,
  "supplierId": 4,
  "paymentStatus": "Paid",
  "paymentMode": "Bank Transfer",
  "notes": "",
  "items": [
    { "size": "11 kg", "regNo": "20", "qty": 10, "unitPrice": 2900 },
    { "size": "45 kg", "regNo": "22", "qty": 2, "unitPrice": 9200 }
  ]
}
```

Validation: supplier required → "Please select a Supplier!"; at least one item → "Please add at least one cylinder line item!"; total qty > 0.

**Server calculates** `lineWeight`, `lineTotal`, `totalQty`, `totalWeight`, `totalAmount`. Never trust totals sent by the client.

**GET `/purchases/stock-breakdown`**

```json
{
  "data": {
    "summary": {
      "11 kg": { "20": 30, "22": 12, "totalQty": 42, "totalWeight": 462 },
      "15 kg": { "20": 0, "22": 5, "totalQty": 5, "totalWeight": 75 },
      "45 kg": { "20": 2, "22": 0, "totalQty": 2, "totalWeight": 90 }
    },
    "overallQty": 49,
    "overallWeight": 627
  }
}
```

---

## 9. Suppliers

### Model: `Supplier`

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `name` | string | Required → "Supplier name is required!" |
| `phone` | string | |
| `location` | string | |
| `status` | enum | `Active`, `Inactive` |

The frontend keeps `totalPurchased` on the supplier and increments it on every new purchase. **Backend rule:** compute it as `SUM(purchase_items.qty)` for the supplier instead.

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/suppliers` | List with `totalPurchased` |
| POST | `/suppliers` | Create |
| PUT | `/suppliers/:id` | Update |
| DELETE | `/suppliers/:id` | Delete (block if purchases exist) |

---

## 10. Expenses

### Model: `Expense`

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `code` | string | `EXP-2026-003` |
| `title` | string | Required |
| `amount` | money | Required, > 0 |
| `categoryId` | FK → ExpenseCategory | |
| `shopId` | FK → Shop, nullable | `null` = "General / All Shops" |
| `date` | date-time | |
| `paymentMethod` | enum | `Cash`, `Online Bank Transfer`, `Company Cheque`, `Credit / Payable` |
| `status` | enum | `Paid`, `Pending` |
| `paidTo` | string | |
| `notes` | string | |
| `createdBy` | FK → User | |

### Model: `ExpenseCategory`

Default categories (from `expenseSlice.js`): Transport & Fuel, Staff Salary & Wages, Utilities & Bills, Tea & Refreshments, Maintenance & Repair, Shop & Depot Rent, Government & License Fees, Miscellaneous. Users can add custom ones; names are unique.

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/expenses` | List. Filters: `categoryId`, `status`, `shopId`, `period` (`TODAY`, `WEEK`, `MONTH`) or `from`/`to`, `search` |
| GET | `/expenses/summary` | `{ total, today, pendingCount, pendingAmount }` (page cards) |
| POST | `/expenses` | Create |
| PUT | `/expenses/:id` | Update |
| DELETE | `/expenses/:id` | Delete |
| GET | `/expenses/export?…` | CSV export with the same filters (the page has "Export CSV") |
| GET | `/expense-categories` | List |
| POST | `/expense-categories` | Add custom category `{ "name": "Generator Fuel" }` |

---

## 11. Committee collection (separate module)

**Keep this module completely separate.** Committee data must only appear on the Committee page. It must not be counted in the Dashboard, Reports, Sales, or any shared total. Give it its own route prefix and its own tables, and restrict it to Super Admin.

### Model: `CommitteeMember`

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `name` | string | Required |
| `phone` | string | |
| `monthlyAmount` | money | Required |
| `totalTarget` | money | Default `monthlyAmount × 6` |
| `totalPaid` | money | **Derived** from collections |
| `status` | enum | `Active`, `Completed` (when `totalPaid ≥ totalTarget`) |

### Model: `CommitteeCollection`

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `code` | string | `COM-1001` (receipt / voucher no.) |
| `memberId` | FK → CommitteeMember | |
| `amount` | money | |
| `date` | date | |
| `paymentMode` | enum | `Cash`, `Bank Transfer`, `Cheque` |
| `receivedBy` | string / FK → User | e.g. "Admin (Ali)" |
| `notes` | string | Default "Committee Collection" |

### Endpoints (prefix `/committee`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/committee/members` | List with `totalPaid`, `pendingBalance`, `paidThisMonth` |
| POST | `/committee/members` | Add member |
| PUT | `/committee/members/:id` | Update |
| DELETE | `/committee/members/:id` | Delete (block if collections exist) |
| GET | `/committee/collections` | Collection history (search: member, staff, code) |
| POST | `/committee/collections` | Record payment; returns the receipt |
| GET | `/committee/collections/:id` | Receipt for printing |
| GET | `/committee/summary` | `{ todayAmount, todayCount, paidThisMonth, pendingCount, pendingBalance, totalCollected }` |

Rules:

- "Paid this month" = member's collections in the **current calendar month** ≥ `monthlyAmount`, or status `Completed`.
- After a collection, set `status = Completed` when `totalPaid ≥ totalTarget`.

---

## 12. Owner personal ledger (separate module)

Also separate, also Super Admin only, also never counted in business totals. It tracks money the owner personally **borrowed** or **lent**.

### Model: `OwnerLedgerParty`

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `name` | string | Required |
| `phone` | string | |
| `type` | enum | `Borrowed` (owner took money) or `Lent` (owner gave money) |
| `initialAmount` | money | Required |
| `totalReturned` | money | **Derived** from ledger transactions |
| `date` | date | |
| `notes` | string | |
| `status` | enum | `Active`, `Cleared` (when `totalReturned ≥ initialAmount`) |

### Model: `OwnerLedgerTxn`

| Field | Type | Notes |
|---|---|---|
| `id` | PK | |
| `code` | string | `OLD-1001` |
| `partyId` | FK → OwnerLedgerParty | |
| `txnType` | enum | `Pay_Back` (for Borrowed) or `Receive_Back` (for Lent) — set by server from party type |
| `amount` | money | |
| `date` | date | |
| `paymentMode` | enum | `Cash`, `Bank Transfer`, `Cheque`, `Online App` |
| `notes` | string | |

### Endpoints (prefix `/owner-ledger`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/owner-ledger/parties` | List. Filters: `type`, `status`, `search` |
| POST | `/owner-ledger/parties` | Add record |
| DELETE | `/owner-ledger/parties/:id` | Delete record and its transactions |
| GET | `/owner-ledger/parties/:id/transactions` | History for the "Ledger" modal |
| POST | `/owner-ledger/parties/:id/transactions` | Pay back / receive back `{ amount, date, paymentMode, notes }` |
| GET | `/owner-ledger/summary` | `{ totalBorrowed, borrowedReturned, payableRemaining, totalLent, lentReturned, receivableRemaining }` |

---

## 13. Dashboard and reports

The Dashboard has a **Today / This Month / This Year** switch. Return everything for one period in a single call.

**GET `/dashboard?period=today|month|year&shopId=`**

```json
{
  "data": {
    "period": "month",
    "totals":  { "sales": 285000, "purchases": 190000, "expenses": 42000, "netProfit": 53000 },
    "counts":  { "sales": 100, "purchases": 6, "expenses": 31 },
    "chart": [
      { "label": "1–7",   "sales": 70000, "purchases": 50000, "expenses": 9000 },
      { "label": "8–14",  "sales": 64000, "purchases": 40000, "expenses": 11000 }
    ],
    "fleet":   { "total": 120, "stock": 30, "customer": 70, "refill": 20 },
    "sizes":   { "11.8": 80, "15": 25, "45.4": 15 },
    "pendingBaqaya": 24000,
    "pendingEmpties": 9,
    "customers": 58,
    "outlets": 3,
    "recent": [
      { "kind": "Sale", "ref": "INV-2026-100", "party": "Ali Raza", "detail": "Domestic 11.8 kg", "amount": 2850, "date": "2026-11-13T09:15:00Z" }
    ]
  }
}
```

Rules (match `Dashboard.jsx`):

- `netProfit = sales − purchases − expenses` for the period. It can be negative; never substitute a placeholder.
- Chart buckets: **today** = 8 slots of 3 hours (`12am, 3am, …, 9pm`); **month** = weeks of the month (`1–7`, `8–14`, …); **year** = 12 months (`Jan`…`Dec`).
- Purchases count by `purchases.date` (date only). Sales and expenses by their date-time.
- `recent` = latest 8 entries across sales, purchases and expenses, newest first.
- Use the server's business timezone (Asia/Karachi, UTC+5) for "today", "this month" and bucket boundaries.
- **Exclude committee and owner ledger data.**

**GET `/reports?range=today|week|month|quarter|year&shopId=`** (the page offers Today, This Week, This Month, This Quarter, This Year; also accept `from`/`to`) — Reports page: `{ refillSales, salesChangePct, securityDepositsHeld, activeBranches, fleetTotal, monthlyRevenue: [{month, amount}], inventoryByCapacity: [{type, count}] }`.

**GET `/reports/export?…`** — CSV of the same data ("Export CSV" button).

---

## 14. Settings

Settings has four tabs. The frontend currently only shows a "saved" toast and does not persist company details, tariffs or notifications, so the backend makes these real.

### Company profile

| Field | Example |
|---|---|
| `name` | Binsuleman Enterprise LPG ERP |
| `tagline` | Safe, Reliable LPG Supply & Logistics across Pakistan |
| `phone` | +92 300 1111111 |
| `email` | info@binsuleman.com |
| `ntn` | 7482910-4 |
| `address` | Plant #1, Industrial Sector, Pakistan |

These also appear on printed receipts.

### Tariffs and security deposits

| Key | Default |
|---|---|
| `domesticRefill` | 2850 |
| `domesticDeposit` | 4500 |
| `comm15kgRefill` | 3600 |
| `comm15kgDeposit` | 6000 |
| `comm45kgRefill` | 9500 |
| `comm45kgDeposit` | 15000 |

The new-sale form should prefill `totalBill` from these rates; new customers and cylinders should take their deposit from them.

### Notifications

`lowStockAlerts`, `dueReturnsAlert`, `dailyEmailSummary`, `smsAlertsToCustomers` (all boolean).

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/settings` | `{ company, rates, notifications }` |
| PUT | `/settings/company` | Super Admin |
| PUT | `/settings/rates` | Super Admin |
| PUT | `/settings/notifications` | Super Admin |
| GET | `/notifications` | Header bell list `{ id, title, message, time, read }` |
| PATCH | `/notifications/read-all` | "Mark all read" |
| PATCH | `/notifications/:id/read` | Mark one read |

Users are covered in [section 3](#3-auth-and-users).

---

## 15. Database schema summary

Relational database (PostgreSQL or MySQL) is recommended because sales, cylinders and balances must stay consistent.

```
users (id, code, name, username, email, password_hash, role, shop_id→shops, phone, status, is_super_admin, created_at)
shops (id, code, name, location, manager, phone, status, created_at)

customers (id, code, name, phone, cnic, address, category, security_deposit, status, created_at)
cylinders (id, code, serial_no UNIQUE, type, weight_kg, tare_weight_kg, shop_id→shops, status,
           customer_id→customers NULL, deposit_pkr, last_refill_date, return_date, updated_at)
cylinder_movements (id, cylinder_id, from_status, to_status, from_shop_id, to_shop_id, user_id, reason, created_at)

sales (id, invoice_no UNIQUE, date, shop_id, customer_id NULL, customer_name, customer_phone,
       issued_cylinder_id NULL, issued_cylinder_reg_no, issued_cylinder_type,
       empty_returned, returned_cylinder_reg_no, total_bill, paid_amount, remaining_balance,
       security_deposit, payment_method, status, created_by, created_at)
sale_payments (id, sale_id, amount, method, received_by, created_at)

purchase_categories (id, slug UNIQUE, name, is_active)
suppliers (id, name, phone, location, status)
purchases (id, code, category_id, date, shop_id, supplier_id, total_qty, total_weight, total_amount,
           payment_status, payment_mode, notes, created_by, created_at)
purchase_items (id, purchase_id, size, reg_no, item_name NULL, qty, unit_price, line_weight, line_total)

expense_categories (id, name UNIQUE)
expenses (id, code, title, amount, category_id, shop_id NULL, date, payment_method, status, paid_to, notes, created_by)

-- Separate modules (Super Admin only, never joined into business totals)
committee_members (id, name, phone, monthly_amount, total_target, status)
committee_collections (id, code, member_id, amount, date, payment_mode, received_by, notes)
owner_ledger_parties (id, name, phone, type, initial_amount, date, notes, status)
owner_ledger_txns (id, code, party_id, txn_type, amount, date, payment_mode, notes)

settings (key PRIMARY KEY, value JSON)       -- company, rates, notifications
notifications (id, user_id NULL, title, message, read, created_at)
audit_log (id, user_id, action, entity, entity_id, before JSON, after JSON, created_at)
```

Indexes worth adding from day one: `sales(date)`, `sales(customer_id)`, `sales(shop_id, date)`, `cylinders(status, shop_id)`, `purchases(date)`, `expenses(date)`, `committee_collections(member_id, date)`.

---

## 16. localStorage → API migration map

Each key below is read and written by the frontend today. Replace each with the listed endpoints.

| localStorage key | Used in | Replace with |
|---|---|---|
| `lpg_erp_system_users`, `lpg_erp_active_user` | `utils/authHelper.js`, Login, Settings, Header | `/auth/*`, `/users` |
| `token` | `api/axiosConfig.js` | JWT from `/auth/login` |
| `lpg_erp_shops_data` | `features/shops/shopSlice.js` | `/shops` |
| `lpg_erp_customers_data` | `features/customers/customerSlice.js` | `/customers` |
| `lpg_erp_inventory_data` | `features/inventory/inventorySlice.js`, Cylinders | `/cylinders` |
| `lpg_erp_sales_data` | `features/sales/salesSlice.js`, Sales, Dashboard | `/sales` |
| `lpg_erp_purchases_data` | `pages/Purchase.jsx`, Dashboard | `/purchases?category=lpg` |
| `lpg_erp_suppliers_data` | `pages/Purchase.jsx` | `/suppliers` |
| `lpg_erp_expenses_data` (expenses + categories) | `features/expense/expenseSlice.js` | `/expenses`, `/expense-categories` |
| `lpg_erp_committee_members`, `lpg_erp_committee_collections` | `pages/CommitteeCollection.jsx` | `/committee/*` |
| `lpg_erp_owner_lenden_parties`, `lpg_erp_owner_lenden_history` | `pages/CommitteeCollection.jsx` | `/owner-ledger/*` |
| `lpg_erp_theme` | `context/ThemeContext.js`, `public/index.html` | **Keep in localStorage** (per-device preference) |

Existing API stub files to update: `features/customers/customerAPI.js`, `features/inventory/inventoryAPI.js` (`/inventory` → `/cylinders`), `features/sales/salesAPI.js`, `features/shops/shopAPI.js`. Expenses, purchases, suppliers, committee, owner ledger, dashboard and settings need new API files.

**Data import:** add a one-time `POST /admin/import` (Super Admin) that accepts the JSON of these localStorage keys, so data already entered in the browser can be moved into the database.

---

## 17. Open decisions

Settle these with the owner before or during the build:

1. **Purchase branch vs shops.** The purchase form uses fixed text values `Branch 1` and `Main Branch`, not the shops list. Decide whether purchases link to `shops` (recommended) and map the two values to shop records.
2. **Purchase stock vs cylinder stock.** Purchases count cylinders by size and reg no, but they do not create `cylinders` rows. Decide whether a purchase should add filled cylinders to stock automatically, or stay a separate stock count.
3. **Custom invoice numbers.** The cashier can type any sales invoice number. Keep this, or always generate them?
4. **Walk-in cylinders.** A sale can issue a cylinder that is not in the system (custom reg no). Keep allowing this, or require every cylinder to be registered first?
5. **Payment methods.** Each module has its own list today:
   - Sales: Cash, Online Bank Transfer, JazzCash / EasyPaisa, Customer Ledger Credit.
   - Expenses: Cash, Online Bank Transfer, Company Cheque, Credit / Payable.
   - Committee: Cash, Bank Transfer, Cheque.
   - Owner ledger: Cash, Bank Transfer, Cheque, Online App.
   - Purchases: no selector yet.

   Agree one list per module (or one shared list) and store it as an enum.
6. **Outlet scoping.** Confirm which roles see all outlets and which see only their own.
7. **Deleting records.** Prefer soft delete (`deleted_at`) for sales, purchases and expenses so reports stay correct and deletions are auditable.

---

## 18. Suggested build order

1. Project setup, database, migrations, `settings` seed (company, rates), error envelope, JWT auth, `/auth/*`, `/users`.
2. `/shops`, `/customers`, `/cylinders` (with movements history).
3. `/sales` with payments and return-empty (the most important flow; write tests for its side effects).
4. `/suppliers`, `/purchase-categories`, `/purchases` (LPG), stock breakdown.
5. `/expenses`, `/expense-categories`, CSV export.
6. `/dashboard`, `/reports`.
7. `/committee/*`, `/owner-ledger/*` (separate, Super Admin only).
8. `/notifications`, `/admin/import`, audit log.
9. Switch the frontend slices from localStorage to the API module by module, in the same order.
