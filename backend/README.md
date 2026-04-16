# 🥛 Amul Dairy Backend — Setup Guide

## Folder Structure

```
dairy-backend/       ← this folder (backend)
├── server.js
├── .env
├── models/
│   ├── Admin.js
│   ├── Customer.js
│   ├── MilkEntry.js
│   └── Price.js
├── routes/
│   ├── auth.js
│   ├── customers.js
│   ├── entries.js
│   ├── payments.js
│   └── prices.js
└── middleware/
    └── auth.js

dairy-frontend/      ← your existing React app
├── src/
│   ├── api.ts       ← copy this file here
│   └── DairyApp.tsx
└── .env             ← add VITE_API_URL=http://localhost:5000
```

---

## Step 1 — Install backend dependencies

```bash
cd dairy-backend
npm install
```

---

## Step 2 — Update your .env password

After resetting your MongoDB password on cloud.mongodb.com,
update the MONGO_URI in `.env`:

```
MONGO_URI=mongodb+srv://ranaharshil557_db_user:NEW_PASSWORD@cluster0.z3yvdfv.mongodb.net/dairy_db
JWT_SECRET=dairy_super_secret_key_change_this_to_something_random
PORT=5000
```

**Important:** Never commit .env to git. It is in .gitignore already.

---

## Step 3 — Start the backend

```bash
# Development (auto-restart on file change)
npm run dev

# Production
npm start
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

---

## Step 4 — Create your admin account (run once)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password_here"}'
```

Or open this in Postman / Thunder Client.

---

## Step 5 — Add VITE_API_URL to your frontend .env

In your React project root, create or edit `.env`:

```
VITE_API_URL=http://localhost:5000
```

---

## Step 6 — Copy api.ts into your frontend

Copy `api.ts` into your React `src/` folder.
Then import and use in DairyApp.tsx:

```ts
import { authAPI, customerAPI, entryAPI, paymentAPI, priceAPI } from "./api";

// Login example
const { token } = await authAPI.login(username, password);
setToken(token);

// Fetch customers
const customers = await customerAPI.list();

// Save an entry (upsert by customerId + date)
await entryAPI.save({
  customerId: "mongo_id_here",
  date: "2025-03-27",
  milkItems: [{ type: "Gold", qty: 1, price: 34 }],
  pettyExpense: 0,
  delivered: true,
});
```

---

## API Reference

### Auth
| Method | Endpoint | Body |
|--------|----------|------|
| POST | /api/auth/register | `{ username, password }` |
| POST | /api/auth/login | `{ username, password }` |
| POST | /api/auth/change-password | `{ currentPassword, newPassword }` |

### Customers
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | /api/customers | List all active |
| POST | /api/customers | Create |
| PUT | /api/customers/:id | Update |
| DELETE | /api/customers/:id | Soft delete |

### Entries
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | /api/entries?month=2025-03 | All entries for month |
| GET | /api/entries?date=2025-03-27 | All entries for date |
| POST | /api/entries | Upsert (create or update) |
| DELETE | /api/entries/:id | Delete |

### Payments
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | /api/payments?customerId=xxx | By customer |
| POST | /api/payments | Record payment |

### Prices
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | /api/prices | Current prices |
| GET | /api/prices/history | All changes |
| PUT | /api/prices | Update + auto-log history |

---

## MongoDB Atlas — Allow Network Access

1. Go to cloud.mongodb.com → Network Access
2. Click **Add IP Address**
3. For local dev: Add your IP
4. For production server: Add your server's IP (or 0.0.0.0/0 for anywhere — not recommended for production)
