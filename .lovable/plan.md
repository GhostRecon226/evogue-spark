
# End-to-End QA Test Plan

I'll exercise the live preview in the browser, hit each route, verify rendering, key interactions, and backend calls. No code changes unless a bug is found (then I'll stop and report before fixing).

## Scope

**Public pages** (visual + nav + links + responsive 1280 / 390):
- `/` (home)
- `/about` — new sections (Our Story, stats strip, Mission, Why Evogue, Values, Graduate Voices, CTA)
- `/courses`
- `/scholarship` — incl. inquiry form submit (test row, will note it)
- `/contact` — incl. contact form submit
- `/auth` — loads, form validation only (no real signup)

**Authenticated area** (only if a test session already exists in preview — I will not create accounts or log in without permission):
- `/_authenticated/*` gate redirects unauthenticated users to `/auth`

**Cross-cutting checks**:
- Navbar links, footer links, 404 route, console errors, failed network requests
- OG/meta tags present on `/about`, `/courses`, `/scholarship`, `/contact`
- Mobile reflow at 390px on `/about` (stats grid, two-column sections)

## What I will NOT do

- No destructive admin actions, no role changes, no deleting rows
- No real user signup / Google OAuth
- No edits to code unless I find a bug — I'll stop and report first

## Deliverable

A pass/fail summary per route + list of any issues found (with severity) and recommended fixes.

Approve to run.
