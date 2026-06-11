## Problem

When an admin (or instructor) opens `/dashboard`, the student dashboard briefly renders and starts fetching student data before the redirect to `/admin` (or `/instructor`) fires. The visible "conflict" is the student UI flashing over — and in some cases racing with — the admin shell.

## Root cause

In `src/hooks/use-auth.tsx`, `loading` is flipped to `false` as soon as `supabase.auth.getSession()` resolves — but `profile`, `roles`, and `instructorCourseIds` are fetched in a separate async call (`loadProfile`) that finishes later. So for one or more renders:

- `authLoading === false`
- `user` is set
- `roles === []` → `isAdmin === false`, `isInstructor === false`

`dashboard.index.tsx` therefore treats the admin as a student: it renders the student dashboard, kicks off all the student queries, and only redirects on a later effect tick when roles finally arrive. That's the conflict the user is seeing.

## Fix

Keep `loading` true until BOTH the session is resolved AND the profile/roles fetch for that session has completed. Components already gate on `authLoading`, so once it accurately reflects "roles known", the redirect in `dashboard.index.tsx` runs before any student UI mounts.

### Technical changes

1. `src/hooks/use-auth.tsx`
   - Stop setting `loading = false` inside `applySession` when a user exists.
   - Set `loading = false` only after `loadProfile` resolves (or rejects) for the active session version. For a signed-out session, set `loading = false` immediately.
   - Keep the existing `sessionVersion` guard so a stale profile fetch can't flip loading for a newer session.

2. `src/routes/_authenticated/dashboard.index.tsx`
   - Guard the student data effect on `!authLoading` in addition to the existing `isAdmin`/`isInstructor` checks, so it never fires for an admin/instructor mid-load.
   - Return a lightweight loading placeholder (not the student layout) while `authLoading` is true, so nothing student-specific paints before the redirect.

No database or RLS changes. No routing/file restructure.

## Out of scope

- Admin and instructor dashboards themselves — they already gate correctly once roles are known.
- Sign-out flow — already correct.
