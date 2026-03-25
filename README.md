# Task Tracker

A task tracking application built with Next.js 16, React 19, and PostgreSQL.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** Supabase
- **UI:** shadcn/ui (base-nova), Tailwind CSS v4, lucide-react, motion
- **Forms:** react-hook-form + zod

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or Supabase project)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your database and Supabase credentials:

   ```bash
   cp .env.example .env
   ```

3. Generate Prisma client and run migrations:

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command          | Description                |
| ---------------- | -------------------------- |
| `npm run dev`    | Start development server   |
| `npm run build`  | Production build           |
| `npm run start`  | Start production server    |
| `npm run lint`   | Run ESLint                 |
