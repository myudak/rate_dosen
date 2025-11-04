# Repository Guidelines

A RateMyProfessor Website Clone

## Project Structure & Module Organization

- Core app routes and pages live in `app/`, using the Next.js App Router (`page.tsx`, `layout.tsx`, `globals.css`).
- Shared UI and interaction pieces reside under `components/`, with subfolders for motion primitives, shadcn-inspired UI, and thematic utilities.
- Shared helpers are in `lib/`; static assets (logos, favicons) sit in `public/`.
- Keep feature-specific assets close to their entry points; create a new subfolder in `components/` when introducing reusable widgets.

## Build, Test, and Development Commands

- `pnpm dev` – run the local development server on port 3001 with hot reload.
- `pnpm build` – create the optimized production build; run before deployment.
- `pnpm start` – serve the production build locally for smoke checks.
- `pnpm lint` – execute ESLint with the Next.js config; ensure it runs clean before submitting changes.

## Coding Style & Naming Conventions

- Follow TypeScript + React (Next.js 16) patterns; prefer functional components with client/server directives as needed.
- Use Tailwind CSS utility-first composition; group related classes semantically and avoid duplicates.
- Name files and modules using PascalCase for components (`Hero.tsx`), camelCase for helpers, and kebab-case for directories when aligned with Next.js routing.
- Keep JSX concise; extract subcomponents when sections exceed ~50 lines.

## Testing Guidelines

- Automated tests are not set up yet; when adding them, colocate with the source (`Component.test.tsx`) and use a consistent testing stack (Vitest or Jest).
- Until a harness exists, rely on `pnpm dev` for manual verification and document manual test steps in PRs involving critical UX flows.

## Commit & Pull Request Guidelines

- Craft commits in imperative mood with a short scope (e.g., `feat: add drawer-driven mobile nav`).
- Squash fixup commits before opening a PR; keep history tidy and feature-focused.
- PR descriptions should summarize intent, list key changes, link relevant issues, and include before/after screenshots or recordings for UI updates.
- Mention required follow-up tasks or technical debt explicitly so maintainers can track them.
