# FocusFlow — Build Plan

A sleek dark-mode study app: Google login, to-do list, full-screen stopwatch focus mode, session review with charts, and a public leaderboard.

## Stack

- **Frontend**: TanStack Start (React 19) + Tailwind v4 + shadcn/ui (already installed)
- **Backend / Auth / DB**: Lovable Cloud (Supabase) with Google OAuth
- **Charts**: Recharts

## Design System

- **Dark mode by default** (apply `.dark` on `<html>`)
- Minimal, high-contrast surfaces; generous spacing; one accent color (indigo/violet)
- Monospace digits for the timer; subtle ticking animation
- All colors defined as semantic tokens in `src/styles.css`

## Database Schema (Lovable Cloud)

**profiles** — one row per user, auto-created on signup via trigger
- `id` (uuid, FK → auth.users, PK)
- `username` (text, unique)
- `avatar_url` (text)
- `visibility` ('public' | 'private', default `'public'`)
- `created_at`

**todos**
- `id`, `user_id` (FK), `title`, `completed` (bool), `created_at`, `completed_at`

**study_sessions**
- `id`, `user_id` (FK), `todo_id` (FK, nullable), `task_title` (text snapshot), `duration_seconds` (int), `started_at`, `ended_at`

**RLS** (strict):
- `todos`, `study_sessions`: owner-only select/insert/update/delete
- `profiles`: owner can update; anyone authenticated can SELECT only rows where `visibility = 'public'` (plus their own row)
- Leaderboard reads via a `SECURITY DEFINER` function that aggregates `study_sessions` for public profiles only — never exposes private user data

## Routes

```text
/                       Landing — pitch + "Sign in with Google"
/login                  Google sign-in screen
/_authenticated/        (protected layout with sidebar nav)
  /app                    To-do list (home for signed-in users)
  /focus/$sessionId       Full-screen Focus Mode (stopwatch)
  /review/$sessionId      Session Review (save/discard + complete-task prompt)
  /history                Past sessions table + bar chart (time per day/week)
  /settings               Username + visibility toggle (Public/Private)
/leaderboard            Public — Daily / Weekly / All-time tabs
```

## User Flow

1. **Land** → Sign in with Google → profile auto-created (default **Public**).
2. **/app** — Add/edit/check-off to-dos. Each row has a "Start Focusing" button.
3. **Start Focusing** → creates a `study_sessions` row with `started_at = now()` and routes to `/focus/$id`.
4. **Focus Mode** — Full-screen black canvas, only the task title and a large counting-up `HH:MM:SS` timer + a single "End Session" button. No nav, no distractions.
5. **End Session** → routes to `/review/$id` showing duration + task. Buttons:
   - **Save to History** → prompts "Mark task complete?" (Yes / No / Cancel) → finalizes the session.
   - **Discard** → deletes the session row.
6. **/history** — Table of past sessions + Recharts bar chart of total minutes per day (last 14 days) and per week (last 8 weeks, toggle).
7. **/leaderboard** — Tabs: **Today / This Week / All-Time**. Ranks public users by summed `duration_seconds`. Shows rank, username, avatar, total hours. Current user highlighted if visible.
8. **/settings** — Edit username; toggle Profile Visibility (Public/Private). Private hides the user from the leaderboard immediately.

## Key Components

- `TodoList` — list, inline add, checkbox, edit, delete, "Start Focusing" CTA
- `FocusTimer` — full-screen layout, counts seconds via `setInterval`, persists `started_at` so refresh recovers correctly
- `SessionReviewCard` — duration summary + Save/Discard + AlertDialog for "Mark task complete?"
- `HistoryChart` — Recharts BarChart of minutes-per-day / per-week
- `LeaderboardTable` — tabbed (daily/weekly/all-time), top-100, podium styling for top 3
- `VisibilityToggle` — Switch in Settings, optimistic update

## Server Functions (TanStack `createServerFn`)

All use `requireSupabaseAuth` middleware so RLS applies as the user:
- `listTodos`, `createTodo`, `updateTodo`, `deleteTodo`, `toggleTodo`
- `startSession({ todoId })` → returns sessionId
- `endSession({ sessionId, save: bool, completeTodo: bool })`
- `listSessions({ range })` for History
- `getStats({ bucket: 'day'|'week' })` for the chart
- `updateProfile({ username, visibility })`

Public (no auth) server function for the leaderboard:
- `getLeaderboard({ range: 'day'|'week'|'all' })` — calls a SECURITY DEFINER SQL function that joins public profiles + summed sessions

## Out of Scope (v1)

- Pomodoro mode (you chose stopwatch only)
- Friends / following / direct messages
- Mobile native; the web UI is fully responsive
- Email-based login (Google only, per spec)

## Technical Notes

- The original spec mentioned Next.js + NextAuth + Prisma; this build uses **TanStack Start + Lovable Cloud (Supabase)** which is the supported Lovable stack and natively provides Google OAuth, Postgres, and RLS — same end-result, no Prisma needed.
- Roles aren't needed (no admin tier in v1), so no `user_roles` table.
- Leaderboard query uses a SQL aggregate function with `SECURITY DEFINER` to safely read across users without weakening RLS on raw tables.
