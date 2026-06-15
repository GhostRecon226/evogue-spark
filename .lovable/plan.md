
## Plan: Enrollment Email Notifications via Lovable Emails

Use Lovable's built-in email system instead of Resend — no API keys to manage, automatic retries, suppression list, and delivery logs.

### 1. Domain setup
- Configure a delegated sending subdomain (recommended: `notify.evogueacademy.com` or `mail.evogueacademy.com`) via the guided email setup dialog.
- This does not touch your Google Workspace MX records — root domain mail keeps working.
- Visible "from" address: `hello@evogueacademy.com` (display-from-root); reply-to also `hello@evogueacademy.com`.
- DNS records are added at your registrar (NS delegation). Propagation can take up to 72 hours; templates and triggers can be built in parallel.

### 2. Email infrastructure
- Provision the email queue, send log, suppression list, and processing cron (one-time setup).

### 3. Templates
Two React Email templates in `src/lib/email-templates/`, styled to match the Evogue brand (read from `src/index.css`):
- **`enrollment-welcome.tsx`** — student welcome email. Subject: "You're in. Welcome to Evogue Academy." Props: `fullName`, `courseName`, `studentId`, `courseDuration`, `loginEmail`, `tempPassword`.
- **`enrollment-admin-notification.tsx`** — admin notification to `evogueconsulting@gmail.com`. Subject: `New Enrollment — {courseName}`. Props: name, email, whatsapp, country, studentId, courseName, amount, currency, originalAmount, discountPercent, couponCode, paymentReference, enrolledAt.
- Both registered in `src/lib/email-templates/registry.ts`.
- Footer line "Built in Africa. Open to the world." included; the system appends the unsubscribe footer automatically (required for compliance — cannot be removed).

### 4. Server function
`sendEnrollmentEmails` in `src/lib/enrollment-emails.functions.ts`:
- Accepts student / course / payment params.
- Fires both emails in parallel via `Promise.all`, posting to `/lovable/email/transactional/send` with idempotency keys (`enroll-welcome-{paymentRef}`, `enroll-admin-{paymentRef}`) so retries don't duplicate.
- Wrapped in try/catch — logs failures with recipient + timestamp, never throws. Enrollment flow is unaffected if a send fails.
- Not wired into a payment-success handler yet (Flutterwave still paused). When that page is built, it will call this function after account creation.

### 5. Test trigger (admin only)
- Add a "Send Test Enrollment Emails" button on `/admin/dashboard` (or a small new admin route) that calls `sendEnrollmentEmails` with sample data.
- Gated by the existing `has_role('admin')` check.
- Lets you verify rendering, branding, and deliverability in the admin's own inbox before payments go live.

### 6. Out of scope (not touched)
- Existing routes, auth setup, coupon logic, Flutterwave integration, and database tables.
- No admin "manual resend" UI (deferred to Phase 6 as you noted).

### Technical notes
- TanStack `createServerFn` is used for the sender, called via `useServerFn` from the admin test button.
- `SENDER_DOMAIN` will be the verified delegated subdomain; `FROM_DOMAIN` stays `evogueacademy.com` so recipients see `hello@evogueacademy.com`.
- Send log queryable in Cloud → Emails for delivery monitoring.

### What you'll need to do
1. Approve this plan.
2. Complete the email domain setup dialog when it appears (add NS records at your registrar).
3. Everything else is automatic — templates, infrastructure, server function, and test trigger get built without further input.
