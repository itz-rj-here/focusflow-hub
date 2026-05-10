# FocusFlow Agent Guide

## Dev Commands

- `npm run dev` - Start dev server (Vite)
- `npm run build` - Production build
- `npm run build:dev` - Dev mode build
- `npm run lint` - ESLint check
- `npm run format` - Prettier write

## Important Config Notes

- Uses `@lovable.dev/vite-tanstack-config` — do NOT add plugins manually in `vite.config.ts`, or the app will break. The config already includes: tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only), componentTagger (dev-only), VITE\_\* env injection, @ path alias.
- Router is auto-generated via TanStack Router — edit route files in `src/routes/` then run build to regenerate `routeTree.gen.ts`.
- shadcn/ui components in `src/components/ui/` using Tailwind v4.

## Deployment

- **Vercel**: Output `dist/client`, build `npm run build`
- **Cloudflare Workers**: Uses `wrangler.jsonc`, main entry `@tanstack/react-start/server-entry`

## Environment

- Supabase with VITE\_ prefix for client-side vars (see `.env`)
- Some Supabase migrations need to be applied to your project (`supabase/migrations/`)

## Linting

- ESLint config in `eslint.config.js` ignores `dist`, `.output`, `.vinxi`
- No typecheck script in package.json
