Lovable Cloud (Supabase) is already connected — auth, the `profiles` table, Google sign-in, login/register/forgot-password pages, the `_authenticated` route guard, the avatar dropdown logout, and the new-user trigger all exist. This plan closes the remaining gaps in your spec.

## What's already in place
- Email + password auth, Google OAuth, auto-confirm email
- `profiles` table with `id`, `full_name`, `email`, `whatsapp`, `avatar_url`, timestamps + `handle_new_user` trigger that copies signup metadata into it
- RLS: users can read/insert/update only their own profile
- `/login`, `/register`, `/forgot-password` pages and `_authenticated` guard redirecting to `/login`
- Logout in the navbar avatar dropdown

## Gaps to fix

### 1. Profiles schema additions
Migration to align with your spec:
- Add `role text not null default 'student'`
- Rename `whatsapp` → `whatsapp_number` (and update the `handle_new_user` trigger + register form + profile page)

Recommendation: keep `role` on `profiles` ONLY for display. For real authorization (admin / instructor checks), use a separate `user_roles` table + `has_role()` security-definer function — storing privileges on `profiles` is a known privilege-escalation risk because users can update their own row. We'll set this up now so future admin features are safe.

### 2. Load profile into app state on login
Extend `useAuth` to also expose `profile` (full row from `profiles`):
- On `onAuthStateChange` SIGNED_IN / initial session → fetch `profiles` row by `user.id` and store in context
- Clear on SIGNED_OUT
- Expose `refreshProfile()` for the profile-edit page

### 3. Add `/reset-password` page (currently missing)
- Forgot-password flow currently redirects the email link to `/login`, which auto-signs the user in WITHOUT letting them set a new password
- Create public route `/reset-password` that detects the recovery session and calls `supabase.auth.updateUser({ password })`
- Update `forgot-password` to use `redirectTo: ${origin}/reset-password`

### 4. Smart "Enroll" CTAs
Create a small `<EnrollButton>` (or `useEnrollHref()` helper) that resolves to:
- `/dashboard` if a session exists
- `/register` otherwise

Replace the current `to="/scholarship"` on:
- `Navbar.tsx` (desktop + mobile Enroll Now)
- `Hero.tsx` (Enroll for the Next Cohort)
- `courses.$slug.tsx` (two Enroll Now buttons)

Recommendation: keep the `/scholarship` page reachable from its own nav link — it serves a different intent (apply for a scholarship) than enrollment.

### 5. Dashboard greeting from profile
Change `dashboard.tsx` to read `profile.full_name` from `useAuth()` instead of `user.user_metadata.full_name`, with a graceful fallback while loading.

### 6. Route guard hardening (recommendation)
Current `_authenticated.beforeLoad` calls `supabase.auth.getSession()` directly — fine, but it can race with session hydration on hard reload. Add a tiny `await supabase.auth.getUser()` fallback, and in the dashboard layout show a brief loader while `useAuth().loading` is true to avoid a content flash.

## Files touched
- `supabase/migrations/<new>.sql` — add `role`, rename `whatsapp` → `whatsapp_number`, recreate trigger, create `user_roles` table + `app_role` enum + `has_role()` function with RLS
- `src/hooks/use-auth.tsx` — add `profile` + `refreshProfile`
- `src/routes/reset-password.tsx` — new page
- `src/routes/forgot-password.tsx` — point `redirectTo` to `/reset-password`
- `src/routes/register.tsx`, `src/routes/_authenticated/dashboard.profile.tsx` — `whatsapp` → `whatsapp_number`
- `src/components/EnrollButton.tsx` — new
- `src/components/landing/Navbar.tsx`, `Hero.tsx`, `src/routes/courses.$slug.tsx` — use `EnrollButton`
- `src/routes/_authenticated/dashboard.tsx` — greet from `profile.full_name`
- `src/routes/_authenticated.tsx` — small race-condition fix

## Best-practice recommendations summary
1. Roles in a dedicated `user_roles` table, never on `profiles` (security)
2. Always pair `resetPasswordForEmail` with a real `/reset-password` page
3. Set up `onAuthStateChange` BEFORE `getSession()` (already done — keep it)
4. Enable Leaked Password Protection (HIBP) in Cloud → Users → Auth Settings — recommend turning this on
5. Consider scaffolding branded auth emails (password reset, verification) once you have a sender domain — happy to set that up after this lands
