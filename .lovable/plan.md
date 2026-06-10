## Plan: Test student account

The database already has a `handle_new_user` trigger that auto-creates a `profiles` row and assigns the `student` role on every new auth signup. So the cleanest way to create your test account is to use the normal signup page — no code or migration changes required.

### Steps

1. Open `/auth` on the preview (or published) site.
2. Switch to the **Sign Up** tab.
3. Use:
   - Email: `peter@evogueacademy.com`
   - Password: `Pass=123@`
   - Fill any required fields (full name, WhatsApp number, etc.) — anything works for a test account.
4. Submit. The trigger automatically:
   - creates the matching `profiles` row (with a generated `EVG-YYYY-####` registration number)
   - inserts `('student')` into `user_roles`
5. If email confirmation is enabled, check the inbox for the confirmation link before logging in. (If you'd like, I can switch on auto-confirm so you can log in immediately without verifying email — just say the word.)

### Why not create it server-side

Lovable Cloud doesn't expose the service-role key to the agent, so I can't script an admin `auth.admin.createUser` call from here. The signup flow does exactly the same thing and is the supported path.

### Optional follow-ups (only if you want)

- Auto-confirm signups (so no email click needed for testing).
- Promote this account to `instructor` or `admin` via a small migration after signup.

Tell me if you'd like either of those, otherwise just sign up at `/auth` and you're in.