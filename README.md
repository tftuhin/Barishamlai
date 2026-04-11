# BuildingHQ — Building Management System

A full-stack web application for residential building management built with **Next.js 14**, **Prisma**, **Supabase**, and **NextAuth.js**.

---

## Features

| Module | Description |
|---|---|
| **Dashboard** | Role-based overview with stats, charts, and recent activity |
| **Billing** | Create and track rent, service charge, gas, water, electricity bills per unit |
| **Expenses** | Log building expenses by category with visual breakdown |
| **Receipts** | Issue digital receipts for paid bills, download as PDF, send via email |
| **Messages** | Admin broadcasts to all residents or specific users |
| **Units** | Manage flats, assign owners and tenants |
| **Reports** | Monthly financial PDF reports with charts |
| **Settings** | Create and manage admin, owner, and tenant accounts |

### User Roles

- **Admin** — Full access: create bills, log expenses, send messages, generate reports
- **Owner** — View unit bills, issue receipts to tenants
- **Tenant** — View own bills, messages, and receipts

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL via Supabase (free tier)
- **ORM:** Prisma
- **Auth:** NextAuth.js (credentials provider)
- **UI:** Tailwind CSS + custom design system
- **Charts:** Recharts
- **Email:** Resend (optional)
- **Deployment:** Vercel (free hobby tier)
- **Fonts:** DM Serif Display + DM Sans (Google Fonts)

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/building-mgmt.git
cd building-mgmt
npm install
```

### 2. Set up Supabase (free database)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**, give it a name
3. Go to **Settings → Database → Connection string → URI**
4. Copy the connection string (it looks like `postgresql://postgres:...@...supabase.co:5432/postgres`)

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Paste your Supabase connection string here
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Generate a random secret: run `openssl rand -base64 32`
NEXTAUTH_SECRET="your-random-secret-here"

# For local development
NEXTAUTH_URL="http://localhost:3000"

# Your building's name (shows in sidebar and reports)
NEXT_PUBLIC_BUILDING_NAME="Green View Residences"

# Optional: Resend for email receipts (get free key at resend.com)
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="BuildingHQ <noreply@yourdomain.com>"
```

### 4. Set up the database

```bash
# Push schema to Supabase
npm run db:push

# Seed with sample data (creates demo accounts)
npm run db:seed
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo accounts (created by seed):**
| Role | Email | Password |
|---|---|---|
| Admin | admin@buildingmgmt.com | admin123 |
| Owner | owner1@example.com | owner123 |
| Tenant | tenant1@example.com | tenant123 |

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/building-mgmt.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project** and import your repository
3. Add environment variables (same as `.env.local` above, but set `NEXTAUTH_URL` to your Vercel domain)
4. Click **Deploy**

> **Important:** After first deploy, copy your Vercel URL (e.g. `https://building-mgmt.vercel.app`) and update `NEXTAUTH_URL` in Vercel environment variables, then redeploy.

### 3. Run database seed on production

After deploying, run locally with your production `DATABASE_URL`:

```bash
DATABASE_URL="your-production-url" npm run db:seed
```

Or use the Supabase SQL editor to run the seed manually.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── bills/                # GET, POST bills
│   │   │   └── [id]/pay/         # PATCH mark as paid
│   │   ├── expenses/             # GET, POST, DELETE expenses
│   │   ├── messages/             # GET, POST messages
│   │   ├── receipts/             # GET, POST receipts
│   │   │   └── [id]/
│   │   │       ├── pdf/          # GET receipt as printable HTML/PDF
│   │   │       └── send/         # POST send receipt via email
│   │   ├── reports/monthly/      # GET monthly PDF report
│   │   ├── units/                # GET, POST units
│   │   └── users/                # GET, POST, DELETE users
│   ├── dashboard/
│   │   ├── billing/              # Billing management
│   │   ├── expenses/             # Expense tracker
│   │   ├── messages/             # Messaging
│   │   ├── receipts/             # Digital receipts
│   │   ├── reports/              # Reports + charts
│   │   ├── settings/             # User management
│   │   └── units/                # Unit management
│   ├── login/                    # Login page
│   ├── globals.css               # Design tokens
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── AuthProvider.tsx
│   └── ui/
│       └── index.tsx             # Card, Button, Modal, Badge, etc.
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── prisma.ts                 # Prisma singleton
│   └── utils.ts                  # Formatting helpers
└── types/
    └── next-auth.d.ts            # Session type extensions
prisma/
├── schema.prisma                 # Database schema
└── seed.ts                       # Sample data
```

---

## Adding More Units / Residents

1. Log in as **Admin**
2. Go to **Settings** → **Add User** to create owner/tenant accounts
3. Go to **Units** → **Add Unit** and assign the owner and tenant
4. Go to **Billing** → **Add Bill** to create their first bills

---

## Email Receipts Setup (Optional)

1. Sign up at [resend.com](https://resend.com) (free: 3,000 emails/month)
2. Add your domain or use their test domain
3. Copy your API key
4. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_your_key
   EMAIL_FROM=BuildingHQ <noreply@yourdomain.com>
   ```

Without an email key, the app still works — receipts can be downloaded as PDF but won't be emailed. In development, the "send" action logs to console.

---

## Database Management

```bash
# Open Prisma Studio (visual DB browser)
npm run db:studio

# Reset database and re-seed
npx prisma db push --force-reset
npm run db:seed

# Generate Prisma client after schema changes
npx prisma generate
```

---

## Customization

### Change building name
Update `NEXT_PUBLIC_BUILDING_NAME` in your `.env.local`

### Change currency
Edit `formatCurrency()` in `src/lib/utils.ts` — currently uses BDT (৳)

### Add bill types
Edit the `BillType` enum in `prisma/schema.prisma` and run `npm run db:push`

### Add expense categories
Edit the `ExpenseCategory` enum in `prisma/schema.prisma`

---

## License

MIT — free to use and modify for your building.
