@AGENTS.md

# Task Tracker — Implementation Guide

## Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: ShadCN (base-nova style, Tailwind CSS v4, Base UI primitives)
- **Icons/Animations**: lucide-react + animate-ui (motion-powered animated icons)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma v7 with `@prisma/adapter-pg` (required in v7; no URL in schema.prisma)
- **Auth**: Supabase Auth via `@supabase/ssr`
- **Validation**: Zod v4 (`err.issues`, not `err.errors`)

## Key Architecture Decisions

### Prisma v7 Setup
- `prisma/schema.prisma` has **no `url`** in the datasource — this moved to `prisma.config.ts`
- `lib/prisma.ts` instantiates PrismaClient with `new PrismaPg({ connectionString })` adapter
- Run `npx prisma db push` (not `migrate dev`) using `DIRECT_URL` (port 5432, not 6543)

### Auth Flow
- Middleware (`middleware.ts`) guards all routes except `/login` and `/auth/*`
- Server actions call `getAuthenticatedUserId()` before any DB operation
- All DB queries filter by `employeeId = auth.uid()`

### Timer State Machine
```
NOT_STARTED → RUNNING → PAUSED → RUNNING → COMPLETED
                  ↓
               COMPLETED
```
- `startedAt`: set when timer starts/resumes, cleared on pause/complete
- `accumulatedMs`: stores total elapsed ms; updated on pause/complete
- Client-side `TimerDisplay` ticks from `accumulatedMs + (now - startedAt)` without writing to DB every second

## File Structure
```
app/
  page.tsx              # Main dashboard (server component, fetches tasks)
  layout.tsx            # Root layout with Toaster
  login/page.tsx        # Login/signup form
  auth/callback/route.ts # Supabase email confirmation callback
components/
  tasks/
    task-list.tsx       # Task cards with inline edit/delete state
    task-form.tsx       # Create/edit dialog
    task-timer-controls.tsx # Start/pause/resume/stop buttons
    task-actions-menu.tsx   # 3-dot context menu (edit, complete, reset, delete)
    task-status-badge.tsx   # Animated status badge
    task-search.tsx         # Debounced search with URL sync
    timer-display.tsx       # Live client-side ticker
    new-task-button.tsx     # "+ New task" button with form trigger
    delete-task-dialog.tsx  # Confirmation alert dialog
  user-menu.tsx         # User info dropdown + sign out
lib/
  prisma.ts             # Prisma singleton with PrismaPg adapter
  actions/
    tasks.ts            # Server actions: CRUD + timer transitions
    auth.ts             # Server actions: signIn, signUp, signOut
  supabase/
    client.ts           # Browser Supabase client
    server.ts           # Server Supabase client (cookie-based)
middleware.ts           # Auth guard redirect
supabase/
  rls_policies.sql      # RLS SQL to run in Supabase dashboard
```

## Environment Variables
```
DATABASE_URL=...       # Supabase pooler (port 6543) — used by PrismaClient at runtime
DIRECT_URL=...         # Supabase direct (port 5432) — used by Prisma CLI for migrations
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## RLS Policies
Run `supabase/rls_policies.sql` in the Supabase SQL editor to enforce row-level security.

## Running Locally
```bash
npm run dev
```

## Applying Schema Changes
```bash
npx prisma db push   # Uses DIRECT_URL from prisma.config.ts
npx prisma generate  # Regenerate client
```

## Acceptance Checklist
- [ ] Employee can create, edit, delete tasks
- [ ] Employee can search tasks by name (debounced, URL-synced)
- [ ] Timer: start → pause → resume; duration survives page reload
- [ ] Completed tasks are visually struck through
- [ ] Only authenticated internal users can access the dashboard
- [ ] RLS policies prevent cross-user data access
