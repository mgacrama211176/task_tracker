# AGENTS.md

Rules and guidelines for AI agents working in this repository.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Frontend Developer

### UI/UX Guidelines

- **Use shadcn/ui components** from `@/components/ui` as the foundation. Do not install alternative component libraries or build primitives from scratch.
- **Add new shadcn components** via the CLI: `npx shadcn@latest add <component>`. Never copy-paste component code manually.
- **Icons:** Use `lucide-react` exclusively. Do not add other icon packages.
- **Animations:** Use `motion` (Framer Motion) for animations. Use `tw-animate-css` classes for simple transitions.
- **Styling approach:**
  - Tailwind CSS v4 utility classes only — no inline styles, no CSS modules, no styled-components.
  - Use the `cn()` helper from `@/lib/utils` to merge conditional classes.
  - Use design tokens (CSS variables) from `globals.css` — e.g., `bg-primary`, `text-muted-foreground`, `border-border`. Never hardcode color values.
  - Use the `--radius` variable for border radius consistency.
- **Dark mode:** Support both light and dark themes. Use Tailwind's `dark:` variant. Theme colors are defined in `globals.css` under `:root` and `.dark`.
- **Responsive design:** Mobile-first. Use Tailwind breakpoints (`sm:`, `md:`, `lg:`). All pages must be usable on mobile.
- **Toasts/notifications:** Use `sonner` via the `<Toaster />` component. No `alert()` or `window.confirm()`.
- **Forms:** Use `react-hook-form` with `zod` schemas for validation. Use `@hookform/resolvers` for integration.

### Component Conventions

- **Server Components by default.** Only add `"use client"` when the component needs browser APIs, hooks, or event handlers.
- **Function declarations** for components, not arrow functions: `function MyComponent()`, not `const MyComponent = () =>`.
- **Props:** Use inline types for simple components. Extract a type/interface only when it's reused or complex.
- **data-slot attributes:** Follow the shadcn pattern — add `data-slot="component-name"` to root elements of reusable components.
- **Composition over configuration:** Prefer composable sub-components (like Card + CardHeader + CardContent) over prop-heavy monolithic components.
- **File naming:** Lowercase kebab-case for all files (e.g., `task-card.tsx`, `use-timer.ts`).

---

## Backend Developer

### Database & Prisma

- **Schema:** All models in `prisma/schema.prisma`. Provider is PostgreSQL.
- **After any schema change**, run:
  1. `npx prisma migrate dev` (creates migration + regenerates client)
  2. Or `npx prisma db push` for prototyping (no migration file)
- **Prisma client** is generated to `lib/generated/prisma` (gitignored). Always import from there.
- **Config:** `prisma.config.ts` handles datasource URL from `DATABASE_URL` env var.
- **Indexes:** Add `@@index` for fields used in queries (see existing `employeeId` and `name` indexes).
- **Use `BigInt`** for millisecond-precision time tracking fields.

### Auth

- **Supabase** handles authentication via `@supabase/ssr` and `@supabase/supabase-js`.
- Server-side auth uses `@supabase/ssr` for cookie-based sessions.
- Never expose Supabase service keys to the client. Use `NEXT_PUBLIC_` prefix only for the anon key and URL.

### API & Data Fetching

- **Server Actions and Server Components** for data mutations and fetching. Prefer these over API routes unless an external client needs the endpoint.
- **Validate all inputs** with `zod` schemas before database operations.
- **Error handling:** Return structured error objects from server actions, not thrown exceptions.

---

## Code Style (All Agents)

- **TypeScript:** Strict mode. No `any` — use `unknown` and narrow. No type assertions (`as`) unless unavoidable.
- **Imports:** Use `@/` path aliases. Group imports: external packages, then `@/` internal, then relative.
- **Naming:**
  - `camelCase` for variables, functions, hooks
  - `PascalCase` for components, types, interfaces
  - `UPPER_SNAKE_CASE` for constants and enum values
  - `kebab-case` for file names
- **No default exports** except for Next.js pages/layouts (which require them).
- **Prefer `function` declarations** over arrow functions for top-level functions and components.
- **Keep files focused.** One component per file. Co-locate related code (component + its types + its hooks) in the same directory when it grows.
