## Goal

Most classroom plumbing is already wired: lessons sidebar, active-lesson highlight in mint, Zoom + PDF buttons, "Mark as Complete" with optimistic update, and progress bars on My Courses + Dashboard Home all read from `lesson_progress`.

What's missing is the completion celebration loop: auto-issuing a certificate, the congrats modal, and a downloadable branded certificate. This plan fills those gaps and tightens the existing flow.

## Changes

### 1. Auto-issue certificate when course is 100% complete
In `src/routes/_authenticated/dashboard.courses.$slug.tsx`, after a successful `lesson_progress` upsert in `toggleComplete`:
- Recompute `completedCount / lessons.length`.
- If it just hit 100% (and wasn't 100% before), `INSERT` into `certificates` with `student_id` and `course_id`.
- Use `.select().maybeSingle()` to ignore duplicates if a cert already exists (we'll add a uniqueness guard — see migration below).
- On success, open a congrats modal.

### 2. Congrats modal with Download Certificate
New component `src/components/dashboard/CertificateModal.tsx` using shadcn `Dialog`:
- Confetti-style hero with `Award` icon, "Congratulations, {full_name}!"
- Course title + completion date
- Primary button: "Download Certificate" → triggers PDF generation
- Secondary button: "View all certificates" → links to `/dashboard/certificates`

### 3. Client-side certificate PDF generator
New helper `src/lib/generate-certificate.ts` using `jspdf` (add via `bun add jspdf`):
- Landscape A4
- Mint/forest brand palette pulled from existing tokens (hex equivalents)
- Layout: Evogue Academy logo/wordmark top-center, "Certificate of Completion" headline (display font fallback to Helvetica-Bold), "This is to certify that", student full name (large), "has successfully completed the course", course title, completion date, signature line ("Evogue Academy — Director of Studies"), border frame in forest green
- Returns/saves `Evogue-Certificate-{course-slug}.pdf` via `doc.save()`
- Used by both the modal and the Certificates page download button (replaces the current `certificate_url` link when null)

### 4. Update Certificates page download
In `dashboard.certificates.tsx`, also fetch `profile.full_name` (already in `useAuth`) and pass `student_name + course_title + issued_at` to `generateCertificate()` on click. The download button is always enabled now.

### 5. Migration: prevent duplicate certificates
Add a unique constraint on `certificates(student_id, course_id)` so the auto-issue insert is idempotent if the user re-toggles a lesson.

### 6. Keep progress fresh
`Dashboard Home` and `My Courses` already refetch on mount/`user` change. After the modal closes, `router.invalidate()` is called so re-navigating to those pages shows the new certificate count and 100% bar without manual refresh. (No realtime channel needed — kept simple.)

## Technical notes

- `jspdf` is pure JS, ~150 KB gzipped, edge-safe — fine for client.
- The certificate is generated on-demand; we don't upload a PDF to Storage. `certificate_url` stays nullable and unused for now.
- Sidebar checkmark already updates immediately via the existing optimistic `setDone` — no change needed.
- Active lesson highlight already uses `bg-mint/30 text-forest` — matches the brief.

## Files

- edit: `src/routes/_authenticated/dashboard.courses.$slug.tsx` (cert insert + modal trigger)
- new: `src/components/dashboard/CertificateModal.tsx`
- new: `src/lib/generate-certificate.ts`
- edit: `src/routes/_authenticated/dashboard.certificates.tsx` (use generator for download)
- migration: unique `(student_id, course_id)` on `certificates`
- dep: `bun add jspdf`
