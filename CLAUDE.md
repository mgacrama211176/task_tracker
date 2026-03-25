@AGENTS.md

# Task Tracker — Implementation Guide

## Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: ShadCN (base-nova style, Tailwind CSS v4, Base UI primitives)
- **Icons/Animations**: lucide-react + animate-ui (motion-powered animated icons)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma v7 with `@prisma/adapter-pg` (required in v7; no URL in schema.prisma)
- **Auth**: Supabase Auth via `@supabase/ssr` — **not yet implemented**
- **Validation**: Zod v4 (`err.issues`, not `err.errors`)

## Key Architecture Decisions

### Prisma v7 Setup
- `prisma/schema.prisma` has **no `url`** in the datasource — this moved to `prisma.config.ts`
- `lib/prisma.ts` instantiates PrismaClient with `new PrismaPg({ connectionString })` adapter
- Singleton pattern: reuses instance across hot reloads in development
- Dev logging: queries, errors, warnings. Production: errors only
- Run `npx prisma db push` (not `migrate dev`) using `DIRECT_URL` (port 5432, not 6543)

### Auth (Planned — Not Yet Implemented)
The following are planned but do not exist yet:
- `middleware.ts` — auth guard for routes
- `app/login/page.tsx` — login/signup form
- `app/auth/callback/route.ts` — Supabase email confirmation
- `components/user-menu.tsx` — user info dropdown + sign out
- `lib/actions/auth.ts` — signIn, signUp, signOut actions
- `lib/supabase/client.ts` and `lib/supabase/server.ts` — Supabase client helpers
- `employeeId` field on Task model for per-user data isolation
- `supabase/rls_policies.sql` exists as a template but references `employeeId` (not yet in schema)

### Timer State Machine
```
NOT_STARTED → IN_PROGRESS → PAUSED → IN_PROGRESS → DONE
                    ↓
                   DONE
```
- `startedAt`: set when timer starts/resumes, cleared on pause/complete
- `accumulatedMs`: stores total elapsed ms (BigInt); updated on pause/complete
- Client-side `TimerDisplay` ticks from `accumulatedMs + (now - startedAt)` without writing to DB every second
- `resetTask()` returns a task to NOT_STARTED with zero accumulated time

### Server Actions Pattern
- All mutations in `lib/actions/tasks.ts` return `ActionResult<T>` (`{ success, data }` or `{ success, error }`)
- Input validated with Zod schemas before any DB operation
- `serializeTask()` converts Prisma's `BigInt` accumulatedMs to `number` for JSON
- All actions call `revalidatePath("/")` after mutation

## File Structure
```
app/
  page.tsx                  # Main dashboard (server component, fetches tasks)
  layout.tsx                # Root layout with Toaster, Montserrat + Geist Mono fonts
  globals.css               # Tailwind v4 theme, CSS variables, dark mode
components/
  tasks/
    task-list.tsx            # Task table with inline edit/delete state
    task-form.tsx            # Create/edit dialog (react-hook-form + zod)
    task-timer-controls.tsx  # Start/pause/resume/stop buttons
    task-actions-menu.tsx    # 3-dot dropdown (edit, complete, reset, delete)
    task-status-badge.tsx    # Animated status badge with pulse for in-progress
    task-search.tsx          # Debounced search (300ms) with URL sync
    timer-display.tsx        # Live client-side ticker (1s interval)
    budget-progress.tsx      # Budget progress bar (green/amber/red)
    new-task-button.tsx      # "+ New task" button with form trigger
    delete-task-dialog.tsx   # Confirmation alert dialog
  ui/                        # ShadCN components (12 files)
lib/
  prisma.ts                  # Prisma singleton with PrismaPg adapter
  utils.ts                   # cn() helper (clsx + tailwind-merge)
  format-duration.ts         # Budget duration formatter (Xh Ym)
  actions/
    tasks.ts                 # Server actions: CRUD + timer transitions
prisma/
  schema.prisma              # Task model, TaskStatus enum
supabase/
  rls_policies.sql           # RLS template (for future auth implementation)
```

## Environment Variables
```
DATABASE_URL=...       # Supabase pooler (port 6543) — used by PrismaClient at runtime
DIRECT_URL=...         # Supabase direct (port 5432) — used by Prisma CLI (prisma.config.ts)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Running Locally
```bash
npm run dev
```

## Applying Schema Changes
```bash
npx prisma db push   # Uses DIRECT_URL from prisma.config.ts
npx prisma generate  # Regenerate client to lib/generated/prisma
```

