<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# The Crumbs — Project Agent Rules

## SPECS.md Maintenance
- **Always ask the user for permission** before updating `SPECS.md`. Do not edit it automatically.
- After getting approval, update the `## ✅ Features Completed` table, add key details sections if needed, and bump the `Last updated` date at the bottom.

## Git Workflow
- The project uses a **Git Flow** branching strategy.
- `main` → production (Vercel hosted). Never push directly.
- `develop` → integration branch. All features branch from here and merge back here.
- **Before starting ANY new feature:** always `git checkout develop` first, then `git checkout -b feature/name`. Never branch off another feature branch.
- PRs always target `develop`, not `main`.
- Only `develop → main` when a stable version is ready to deploy.

> ❌ Never do: `feature/google-oauth → feature/something-else` (chained features)
> ✅ Always do: `develop → feature/something-new`

## Branch Cleanup (Post-Merge)
- **After merging a feature branch back into `develop`**, always delete the branch both **locally** and on **GitHub remote**.
  ```bash
  git branch -d feature/name          # delete locally
  git push origin --delete feature/name  # delete on remote
  ```
- This keeps the branch list clean and prevents clutter.

## Direct commits to `develop` (acceptable exceptions)
- **Minor bug fixes** (e.g. config typos, one-line repairs) → commit directly to `develop` is fine.
- **Small UX tweaks** (e.g. adding a confirmation dialog to an existing feature) → `develop` is okay.
- **New features or major changes** → always create a `feature/` branch first, no exceptions.
