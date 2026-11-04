# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # next dev (Turbopack)
npm run build      # next build
npm run lint       # eslint
npx prisma migrate dev     # apply/create migrations (needs DATABASE_URL + DIRECT_URL in .env)
npx prisma db seed         # creates/updates the admin user (needs ADMIN_EMAIL + ADMIN_PASSWORD)
```

No test runner is configured. Validate changes with `npm run lint` and `npm run build`.

## Architecture

escalai: PT-BR volunteer/team scheduling PWA ("escalas"). Next.js 16 App Router, React 19, Prisma 6 + PostgreSQL, Auth.js v5 (next-auth beta, credentials + JWT), Tailwind 4, shadcn-style UI on `@base-ui/react`, Zod 4 + react-hook-form. UI text, routes and domain names are Portuguese (`departamentos`, `indisponibilidades`, `lider`, `funcoes`). Path alias `@/*` is the repo root.

### Auth and authorization
- `proxy.ts` (Next 16 replacement for `middleware.ts`) runs `NextAuth(authConfig).auth`. `lib/auth.config.ts` is edge-safe (no Prisma/bcrypt) and holds the `authorized` callback: unauthenticated users go to `/login`, `/admin/**` requires `isAdmin`. `lib/auth.ts` adds the Credentials provider and JWT callbacks.
- Session/JWT carries `id`, `isAdmin`, `mustChangePassword`, `departmentRoles` (typed in `types/next-auth.d.ts`). These are loaded **only at login**, so membership/role changes do not reach an active session. Do not trust `departmentRoles` for security checks.
- Authorization lives in `lib/permissions.ts` (`requireUser`, `requireAdmin`, `requireAnyDepartmentLeader`, `requireDepartmentLeader(id)`, `requireDepartmentMember(id)`). The department-scoped checks query `DepartmentMembership` in the DB. Admin bypasses them. Denied access calls `notFound()`, not 403. Call the matching `require*` at the top of every server action and page.
- New users get `DEFAULT_PASSWORD` (`lib/password.ts`) with `mustChangePassword`, forced through `/trocar-senha`.

### Data model (`prisma/schema.prisma`)
`User` ↔ `Department` via `DepartmentMembership` (role `LIDER`/`MEMBRO`). A `ScheduleEntry` (department + `@db.Date` date, optional time/title/note) has many `ScheduleAssignment` (user + optional `Position` of that department). `AvailabilityRequest` is a member's justified-absence request (`PENDENTE`/`APROVADA`/`RECUSADA`) reviewed by a leader. Columns are snake_case via `@map`. Dates are date-only: build them with `Date.UTC(...)` to avoid timezone shifts.

Scheduling rules enforced in `app/(app)/departamentos/[departmentId]/actions.ts`: a user cannot be assigned if they have an approved absence that day, or are already scheduled in another department that day.

### Routes (`app/`)
- `(public)/login`; `(app)/**` authenticated shell (`components/shell`: bottom nav on mobile, desktop nav); `(app)/admin/**` admin only (users, departments); `(app)/departamentos/[departmentId]/**` per-department schedule, entries and positions; `(app)/lider` leader day view; `(app)/indisponibilidades` member absence requests; `trocar-senha` outside the `(app)` group.
- Mutations are server actions in colocated `actions.ts` files, with Zod schemas in `lib/validations/*`.

### Toast feedback conventions
Two patterns, both surfaced through `sonner`:
- Forms: `hooks/use-toast-action-state.ts` wraps `useActionState`. The action returns `{ error?, success? }`.
- Actions that redirect: `lib/toast-redirect.ts` `redirectWithToast(path, "success" | "error", msg)` puts `?toast=&toastMsg=` in the URL. `components/toast-listener.tsx` shows it and strips the params.

## Notes
- Next.js 16 differs from older versions (see AGENTS.md): read `node_modules/next/dist/docs/` before using Next APIs.
- `.env*` and `/.claude/` are gitignored. `.claude/skills` and `.agents/skills` hold local tooling skills, not app code.
- `README.md` is the unmodified create-next-app template.
