## Goal
Give you a working login so you can explore the backend (admin portal + student dashboard).

## What I'll create

Two test accounts via the Supabase Auth Admin API (so emails are pre-confirmed and you can log in immediately):

1. **Admin account**
   - Email: `admin@evogue.test`
   - Password: `Admin123!`
   - Role: `admin` (full access to `/admin`)

2. **Student account**
   - Email: `student@evogue.test`
   - Password: `Student123!`
   - Role: `student` (access to `/dashboard`)

Both will get auto-generated registration numbers via the existing `handle_new_user` trigger. The admin's role will be upgraded from the default `student` to `admin` in `user_roles`.

## How

1. Run a one-off server-side script using `supabaseAdmin.auth.admin.createUser` for both accounts (emails confirmed).
2. `INSERT` an `admin` row into `user_roles` for the admin account (the trigger gives them `student` by default; admin is additive).
3. Verify both rows in `profiles` and `user_roles`.
4. Report back the credentials so you can sign in at `/login`.

## Confirm before I proceed
- OK with those emails/passwords? Or want to provide your own?
- Want me to also seed a sample course + cohort + enrollment so the student dashboard isn't empty?
