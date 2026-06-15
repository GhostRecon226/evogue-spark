import { createServerFn } from '@tanstack/react-start'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { getRequestHeader } from '@tanstack/react-start/server'

export interface EnrollmentEmailInput {
  // Student
  fullName: string
  studentEmail: string
  whatsapp?: string
  country?: string
  studentId: string
  // Login (welcome email)
  tempPassword: string
  // Course
  courseName: string
  courseDuration?: string
  // Payment
  amount: string | number
  currency: string
  originalAmount?: string | number
  discountPercent?: string | number
  couponCode?: string | null
  paymentReference: string
  enrolledAt?: string
}

async function postSend(authHeader: string, body: Record<string, unknown>) {
  // Build absolute URL so this works during SSR / inside server fn handlers.
  const host =
    getRequestHeader('x-forwarded-host') ??
    getRequestHeader('host') ??
    'localhost'
  const proto = getRequestHeader('x-forwarded-proto') ?? 'https'
  const url = `${proto}://${host}/lovable/email/transactional/send`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: authHeader,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Send failed (${res.status}): ${text}`)
  }
  return res.json()
}

/**
 * Sends the welcome email to the student and the admin notification in parallel.
 * Never throws — failures are logged but do not block the enrollment flow.
 */
export const sendEnrollmentEmails = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: EnrollmentEmailInput) => input)
  .handler(async ({ data }) => {
    const authHeader = getRequestHeader('authorization') ?? ''
    const enrolledAt = data.enrolledAt ?? new Date().toISOString()
    const ref = data.paymentReference || crypto.randomUUID()

    const welcomePayload = {
      templateName: 'enrollment-welcome',
      recipientEmail: data.studentEmail,
      idempotencyKey: `enroll-welcome-${ref}`,
      templateData: {
        fullName: data.fullName,
        courseName: data.courseName,
        studentId: data.studentId,
        courseDuration: data.courseDuration ?? '',
        loginEmail: data.studentEmail,
        tempPassword: data.tempPassword,
      },
    }

    const adminPayload = {
      templateName: 'enrollment-admin-notification',
      // template.to overrides this server-side, but include for clarity
      recipientEmail: 'evogueconsulting@gmail.com',
      idempotencyKey: `enroll-admin-${ref}`,
      templateData: {
        fullName: data.fullName,
        studentEmail: data.studentEmail,
        whatsapp: data.whatsapp ?? '—',
        country: data.country ?? '—',
        studentId: data.studentId,
        courseName: data.courseName,
        amount: data.amount,
        currency: data.currency,
        originalAmount: data.originalAmount ?? data.amount,
        discountPercent: data.discountPercent ?? 0,
        couponCode: data.couponCode ?? null,
        paymentReference: ref,
        enrolledAt,
      },
    }

    const results = await Promise.allSettled([
      postSend(authHeader, welcomePayload),
      postSend(authHeader, adminPayload),
    ])

    const summary = {
      welcome:
        results[0].status === 'fulfilled'
          ? 'queued'
          : `failed: ${(results[0] as PromiseRejectedResult).reason}`,
      admin:
        results[1].status === 'fulfilled'
          ? 'queued'
          : `failed: ${(results[1] as PromiseRejectedResult).reason}`,
    }

    if (results[0].status === 'rejected') {
      console.error('[enrollment-emails] welcome send failed', {
        recipient: data.studentEmail,
        at: new Date().toISOString(),
        error: (results[0] as PromiseRejectedResult).reason,
      })
    }
    if (results[1].status === 'rejected') {
      console.error('[enrollment-emails] admin send failed', {
        recipient: 'evogueconsulting@gmail.com',
        at: new Date().toISOString(),
        error: (results[1] as PromiseRejectedResult).reason,
      })
    }

    return { ok: true, summary }
  })
