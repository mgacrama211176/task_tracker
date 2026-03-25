# Task Tracker

An internal employee task time-tracking application. Employees can create tasks, track time spent on each via a built-in timer, and monitor task completion status.

## Tech Stack

| Layer          | Technology                                                       |
| -------------- | ---------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack)                               |
| Language       | TypeScript 5 (strict mode)                                       |
| UI             | ShadCN/UI (base-nova style), Tailwind CSS v4, lucide-react icons |
| Animations     | motion (Framer Motion), tw-animate-css                           |
| Database       | PostgreSQL via Supabase                                          |
| ORM            | Prisma v7 with `@prisma/adapter-pg`                              |
| Auth           | Supabase Auth (`@supabase/ssr`) — _not yet implemented_          |
| Validation     | Zod v4                                                           |
| Forms          | react-hook-form + @hookform/resolvers                            |
| Notifications  | sonner                                                           |

## Features

- Create, edit, and delete tasks
- Timer with start / pause / resume / complete workflow
- Timer duration persists across page reloads (stored as `accumulatedMs` in DB)
- Live client-side timer ticker (no per-second DB writes)
- Debounced task search with URL sync
- Completed tasks visually struck through
- Status badges with color coding and animated pulse for running tasks
- Responsive layout (mobile-first)
- Toast notifications for all actions

## Project Structure

```
app/
  page.tsx                  # Main dashboard (server component)
  layout.tsx                # Root layout with Toaster, fonts
  globals.css               # Tailwind v4 theme and CSS variables
components/
  tasks/
    task-list.tsx            # Task table with inline edit/delete state
    task-form.tsx            # Create/edit dialog (react-hook-form + zod)
    task-timer-controls.tsx  # Start/pause/resume/stop buttons
    task-actions-menu.tsx    # 3-dot dropdown (edit, complete, reset, delete)
    task-status-badge.tsx    # Animated status badge
    task-search.tsx          # Debounced search with URL sync
    timer-display.tsx        # Live client-side ticker
    new-task-button.tsx      # "+ New task" button
    delete-task-dialog.tsx   # Confirmation alert dialog
  ui/                        # ShadCN components (alert-dialog, badge, button, etc.)
lib/
  prisma.ts                  # Prisma singleton with PrismaPg adapter
  utils.ts                   # cn() helper for Tailwind class merging
  actions/
    tasks.ts                 # Server actions: CRUD + timer state transitions
prisma/
  schema.prisma              # Task model, TaskStatus enum
supabase/
  rls_policies.sql           # RLS policies (template for future auth)
```

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (PostgreSQL database)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with your Supabase credentials:

   ```
   DATABASE_URL=postgresql://...@pooler.supabase.com:6543/postgres
   DIRECT_URL=postgresql://...@pooler.supabase.com:5432/postgres
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```

3. Push the schema to your database and generate the Prisma client:

   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command          | Description                                  |
| ---------------- | -------------------------------------------- |
| `npm run dev`    | Start development server (Turbopack)         |
| `npm run build`  | Generate Prisma client + production build    |
| `npm run start`  | Start production server                      |
| `npm run lint`   | Run ESLint                                   |

## Schema Changes

After modifying `prisma/schema.prisma`:

```bash
npx prisma db push      # Push changes (uses DIRECT_URL, port 5432)
npx prisma generate     # Regenerate client to lib/generated/prisma
```
