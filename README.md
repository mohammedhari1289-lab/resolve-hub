# ResolveHub – Complaint Management System

A full-stack complaint management system built with **Next.js 14 (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, **PostgreSQL** and **Prisma**.
Users raise complaints, staff work on them, admins assign and oversee everything. Every dashboard number, chart, search and filter is computed from the database.

## Features

| Area | What it does |
|---|---|
| Auth | Register, login, logout. Passwords hashed with bcrypt (cost 12). Signed, httpOnly JWT cookie. Roles: USER, STAFF, ADMIN. Login throttling. |
| User | Submit complaints (category + priority), unique ID like `RH-26-K7M2QX`, track status and full timeline, close a resolved complaint. |
| Staff | See only assigned complaints, change status (Under Review / In Progress / Resolved), add remarks, write resolution notes. |
| Admin | Manage users & staff (create, role, department, deactivate), categories, departments, assign complaints, see every complaint. |
| Tracking | Submitted → Under Review → In Progress → Resolved → Closed, stored as `ComplaintHistory`. Public `/track` page shows status only. |
| Analytics | Total / pending / in progress / resolved cards, status donut, 14-day trend, priority and category charts. Scoped per role. |
| Search & filters | Search by complaint ID, title or category; filter by status, priority, category (and assignee for admins); pagination. |
| Notifications | In-app notifications (new complaint, assignment, status change) with unread badge, plus success/error toasts on every action. |
| SEO | Page titles, descriptions, Open Graph/Twitter metadata, generated OG image, `sitemap.xml`, `robots.txt`, JSON-LD, noindex on private pages. |
| UI | Responsive sidebar (mobile drawer), cards, tables, forms, Lucide icons, dark mode. |

## Setup

Requirements: Node.js 18.18+ and PostgreSQL 14+ (or Docker).

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env          # on Windows: copy .env.example .env
#   then set AUTH_SECRET (openssl rand -base64 32) and DATABASE_URL

# 3. Start PostgreSQL (skip if you already have one)
docker compose up -d

# 4. Create tables and load sample data
npx prisma migrate dev --name init
npm run db:seed

# 5. Run
npm run dev                   # http://localhost:3000
```

Quick alternative to step 4 (no migration files): `npx prisma db push && npm run db:seed`.

### Demo accounts (from the seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@resolvehub.dev | Admin@123 |
| Staff | staff1@resolvehub.dev, staff2@…, staff3@… | Staff@123 |
| User | user1@resolvehub.dev, user2@…, user3@… | User@123 |

Re-running `npm run db:seed` wipes and recreates the sample data.

### Production

```bash
npm run build && npm start
```
Set `NEXT_PUBLIC_APP_URL` to your real domain, use a strong `AUTH_SECRET`, run `npx prisma migrate deploy`, and serve over HTTPS.

## Project structure

```
prisma/            schema.prisma, seed.ts
src/middleware.ts  redirects signed-out visitors away from private routes
src/lib/           prisma client, auth (JWT session), validators (zod), queries (role scoping), notify, constants
src/actions/       server actions: auth.ts, complaints.ts, admin.ts
src/components/    AppShell (sidebar), Charts, ComplaintTable, ui/ (ActionForm, badges, cards...)
src/app/
  page.tsx, login, register, track          public pages
  sitemap.ts, robots.ts, opengraph-image.tsx
  (app)/dashboard, complaints, notifications, admin/*   authenticated area
```

## Security model

- **Server-side authorization**: every page and action calls `requireUser(roles)`. The middleware is only a convenience redirect.
- **Row-level scoping**: all complaint queries include `scopeWhere(user)`; users see own complaints, staff see assigned ones, admins see all. Someone else's complaint URL returns 404.
- **Action permissions** (`updateStatusAction`): admin any status; staff only on assigned complaints and only to Under Review / In Progress / Resolved; user can only close their own resolved complaint.
- **Validation**: all input validated with Zod on the server. Prisma uses parameterised queries.
- **Sessions**: session user is re-loaded from the DB each request, so deactivating an account or changing a role applies immediately.
- **Public sign-up** always creates a USER; staff/admin are created by an admin. Admins cannot demote or deactivate themselves.
- Security headers are set in `next.config.mjs`.
- Known limits for a production deployment: the login throttle is in-memory (use Redis for multiple servers), and there is no email verification or password reset.

## Useful commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run db:studio` | Browse data in Prisma Studio |
| `npm run db:seed` | Reset and load sample data |
| `npm run db:reset` | Drop the database, re-run migrations and seed |
| `npm run build` | Production build |
