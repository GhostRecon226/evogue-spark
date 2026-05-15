## Goal
Make the navbar auth area deterministic so it never renders as an empty/blank circle again.

## Plan
1. Update the navbar auth rendering logic so the right-side slot always shows one of two valid states:
   - logged out / auth not ready: the dark green Login pill
   - logged in: the mint initials avatar with dropdown

2. Refine the auth hook readiness flow to avoid transient “unknown” UI states during session restoration on refresh/reload.
   - Keep the auth state synchronized from the initial session check and auth-change listener
   - Prevent stale updates from briefly clearing the navbar state

3. Remove any fallback path that can produce the gray placeholder circle.
   - Ensure the avatar only renders when a real user exists
   - Ensure the logged-out fallback is always the Login button, never an empty avatar shell

4. Validate the fix in preview for both states:
   - logged out: Login button visible in the header
   - logged in: mint initials avatar visible, opens Dashboard / Logout dropdown

## Technical details
- Target files: `src/components/landing/Navbar.tsx`, `src/hooks/use-auth.tsx`
- Keep button size, spacing, and placement unchanged
- Preserve the existing avatar/dropdown behavior for authenticated users
- No backend/schema changes