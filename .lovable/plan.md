The Login button is missing because the navbar intentionally renders nothing while auth is still in its loading state.

## What’s happening
- `Navbar.tsx` currently does: `loading ? null : user ? avatar : Login`
- That means the right side of the header is blank whenever auth has not finished restoring the session yet.
- In `use-auth.tsx`, `loading` starts as `true` and only flips after the initial auth/session check resolves.
- If that initial check is delayed during preview reloads or session restore, the navbar shows an empty state instead of the Login button.

## Plan
1. Refine the auth readiness flow in `use-auth.tsx` so the session restoration path is handled deterministically.
2. Update the navbar rendering logic so it never shows a blank placeholder circle or empty auth slot.
3. Keep the intended behavior:
   - logged out → show Login button
   - logged in → show avatar with initials and dropdown
4. Verify both desktop and mobile nav states after session load, sign-in, and sign-out.

## Technical details
- Review the ordering between `getSession()` and `onAuthStateChange()` in the auth hook.
- Preserve the current logged-in avatar/dropdown behavior.
- Remove any transient empty auth UI from the navbar so visitors always see a clear final state.