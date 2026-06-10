## Plan: Inquiries admin upgrades + email notifications + WhatsApp follow-up

### 1. Email notification on new inquiry
- Set up Lovable's built-in email infrastructure (email domain + queue + templates). If a sender domain is not yet configured, I'll prompt you to set one up — once it's in place, everything else proceeds automatically.
- Create a branded "New inquiry received" template addressed to **evogueconsulting@gmail.com** with the submitter's name, email, WhatsApp, course interest, source (contact/scholarship), and message.
- Trigger the email from the contact form submission flow (and the scholarship form, since both write to the same `inquiries` table). Idempotency key derived from inquiry id so retries don't duplicate.

### 2. Admin inbox upgrades (`/admin/inquiries`)
- Add a **Read status** filter: All / Unread / Read.
- Add a **Source** filter: All / Contact / Scholarship (replaces the current "Type" select with clearer labels).
- Add a **search box** (name/email/message) for quick triage.
- Unread count badge at the top.
- Keep existing per-row Mark read/unread toggle.

### 3. WhatsApp follow-up button
- New action per row: **WhatsApp** button (only enabled when the inquiry has a `whatsapp_number`).
- Opens `https://wa.me/<digits>?text=<prefilled>` in a new tab. Prefilled message references the inquirer's name and course interest, e.g.:
  > "Hi {name}, this is Evogue Consulting following up on your inquiry about {course_interest or 'our programmes'}. How can we help?"
- No API costs, no extra credentials.

### 4. CSV export
- **Export CSV** button above the table. Exports the **currently filtered** rows (so admins can export e.g. unread scholarship inquiries only).
- Columns: Name, Email, WhatsApp, Course Interest, Source, Read, Message, Created At (ISO).
- Filename: `inquiries-YYYY-MM-DD.csv`.

### Technical notes
- Email sending uses Lovable Emails via a server function called from the existing contact/scholarship submit paths; failures are logged but do not block the form submission for the user.
- CSV export is client-side (no extra endpoint).
- No database schema changes required — the `inquiries` table already has all needed columns.
