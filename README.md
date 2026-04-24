# Leaveflow

> A considered take on leave, PTO and absence tracking — inspired by LeaveBoard.

A frontend-only prototype built with Next.js 15, TypeScript, Tailwind, and shadcn/ui. All data is mocked in `lib/mock/` — no backend required.

## What's in here

- **Dashboard** — greeting, allowance cards, pending approvals, out-of-office today
- **Requests** — approvals inbox with approve/reject, tabbed view (pending / mine / all)
- **Team calendar** — month grid with leave overlays, holiday markers, conflict highlighting (3+ from same team)
- **Directory** — 14 employees across 5 teams, role badges, PTO usage bars
- **Holidays** — 55 public holidays across 11 countries, grouped by month
- **Reports** — KPIs, breakdowns by type / month / employee, CSV export
- **Settings** — leave types, policies, company, integrations

## Aesthetic

Editorial, not corporate — warm paper background, Instrument Serif display type, Inter body, ochre + sage accents. Deliberately avoids the generic purple-gradient SaaS look.

## Get started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

```bash
npx vercel
```

Or push to GitHub and import in the Vercel dashboard — it'll auto-detect Next.js.

## Switching user roles

The "current user" is set in `lib/mock/employees.ts`:

```ts
export const CURRENT_USER_ID = "e1"; // Amara — manager
```

Try:
- `"e1"` Amara (Engineering manager — sees pending approvals)
- `"e11"` Aditi (Head of People / admin)
- `"e2"` Takeshi (regular employee)

## Next steps when you add a backend

The mock data layer in `lib/mock/` is organized exactly like database tables would be. Swap each file for a data-fetching hook:

1. **Auth & users** → Supabase Auth or NextAuth, replacing `CURRENT_USER_ID`
2. **Leave requests** → `POST /api/requests`, with Prisma or Supabase
3. **Balances** → computed server-side in a database view or query
4. **Holidays** → seed once from the `holidays.ts` file, or fetch from a public calendar API

The type contracts in `lib/types.ts` are database-ready.

## Project structure

```
app/
  layout.tsx          # Root layout, fonts, shell
  page.tsx            # Dashboard
  requests/page.tsx
  calendar/page.tsx
  team/page.tsx
  holidays/page.tsx
  reports/page.tsx
  settings/page.tsx
  globals.css
components/
  layout/app-shell.tsx
  request-leave-dialog.tsx
  ui/                 # shadcn primitives
lib/
  types.ts
  utils.ts
  utils/dates.ts
  mock/
    employees.ts
    leave-types.ts
    leave-requests.ts
    holidays.ts
```
