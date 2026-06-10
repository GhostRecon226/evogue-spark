The user wants to remove the "Meet the team" section from the `/about` page.

Changes needed in `src/routes/about.tsx`:
1. Remove the unused `Avatar`, `AvatarImage`, and `AvatarFallback` imports.
2. Remove the `team` data array (4 team members).
3. Remove the entire `<section className="bg-mint-tint py-14 sm:py-20">...</section>` block containing the "Meet the team" heading and team member cards grid.

Everything else on the About page (Our Story, Our Mission, Our Values) will remain untouched.