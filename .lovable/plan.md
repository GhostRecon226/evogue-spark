In `src/components/landing/Navbar.tsx`, in the logged-out state (both desktop and mobile menus):

- Remove the outline "Login" button.
- Keep the solid secondary "Enroll Now" button but change its label to "Login" and point it to `/login` instead of `/contact`.

No other files affected. No logic/auth changes.