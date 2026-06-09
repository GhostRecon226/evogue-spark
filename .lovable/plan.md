## What's happening

Two things in the current setup explain the "delay, then a brief wrong page before the real one" feeling:

1. **No link preloading.** The router (`src/router.tsx`) doesn't set `defaultPreload`, so when you click a link it has to fetch the route's code and data *after* the click. That's the "delay before it goes to the specific page."

2. **Auth gate can flash a redirect.** `src/routes/_authenticated.tsx` reads `loading` and `user` from `AuthProvider`. On a hard refresh of any protected URL (e.g. `/dashboard`), Supabase's session is restored asynchronously from `localStorage`. The provider currently sets `loading = false` as soon as *either* `onAuthStateChange` or `getSession()` fires — and `onAuthStateChange` can fire first with no user, briefly showing `user = null` and triggering `<Navigate to="/login" />`. A moment later the real session lands and `/login`'s `beforeLoad` bounces you back. That's the "redirects to a different page first."

## Fix

### 1. Enable intent preloading on the router

`src/router.tsx`: add `defaultPreload: "intent"`. TanStack will warm the next route on hover/focus/touch-start so the click feels instant.

```ts
const router = createRouter({
  routeTree,
  context: { queryClient },
  scrollRestoration: true,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});
```

### 2. Make `AuthProvider` wait for `getSession()` before reporting `loading: false`

`src/hooks/use-auth.tsx`: today both the `getSession()` resolver and the `onAuthStateChange` listener call `applySession`, which sets `loading = false`. We'll keep `loading = true` until the initial `getSession()` call settles, regardless of which event happens first. `onAuthStateChange` still updates the session and profile; it just no longer prematurely flips `loading` to false on the first INITIAL_SESSION fire.

Net effect: the `_authenticated` guard shows its existing spinner instead of momentarily seeing `user = null` and redirecting.

### 3. (Light cleanup, optional) Make protected loaders cheaper

No loaders currently call `requireSupabaseAuth` at the route level, so no further refactor is needed. Existing pages keep working.

## Verification

After the change I'll:
- Hard-refresh `/dashboard` while signed out → should land directly on `/login` (no flash).
- Hard-refresh `/dashboard` while signed in → spinner, then dashboard (no `/login` flash).
- Click between public pages (Courses, About, Blog, Contact) → instant, no perceptible delay thanks to intent preloading.

## Out of scope

No content, styling, route structure, or other behavior changes. Only `src/router.tsx` and `src/hooks/use-auth.tsx` are touched.
