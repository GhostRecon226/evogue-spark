import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  fullName?: string
  studentEmail?: string
  whatsapp?: string
  country?: string
  studentId?: string
  courseName?: string
  amount?: string | number
  currency?: string
  originalAmount?: string | number
  discountPercent?: string | number
  couponCode?: string | null
  paymentReference?: string
  enrolledAt?: string
}

const Email = ({
  fullName = '—',
  studentEmail = '—',
  whatsapp = '—',
  country = '—',
  studentId = '—',
  courseName = '—',
  amount = '—',
  currency = '',
  originalAmount = '—',
  discountPercent = '0',
  couponCode = null,
  paymentReference = '—',
  enrolledAt = new Date().toISOString(),
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      New enrollment: {fullName} — {courseName}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Enrollment — {courseName}</Heading>
        <Text style={paragraph}>
          New student enrolled and payment confirmed.
        </Text>

        <Section style={card}>
          <Text style={label}>STUDENT DETAILS</Text>
          <Text style={row}><strong>Name:</strong> {fullName}</Text>
          <Text style={row}><strong>Email:</strong> {studentEmail}</Text>
          <Text style={row}><strong>WhatsApp:</strong> {whatsapp}</Text>
          <Text style={row}><strong>Country:</strong> {country}</Text>
          <Text style={row}><strong>Student ID:</strong> {studentId}</Text>
        </Section>

        <Section style={card}>
          <Text style={label}>ENROLLMENT DETAILS</Text>
          <Text style={row}><strong>Course:</strong> {courseName}</Text>
          <Text style={row}>
            <strong>Amount Paid:</strong> {amount} {currency}
          </Text>
          <Text style={row}>
            <strong>Original Amount:</strong> {originalAmount}
          </Text>
          <Text style={row}>
            <strong>Discount Applied:</strong> {discountPercent}% (
            {couponCode ? couponCode : 'None'})
          </Text>
          <Text style={row}>
            <strong>Payment Reference:</strong> {paymentReference}
          </Text>
          <Text style={row}>
            <strong>Enrolled At:</strong> {enrolledAt}
          </Text>
        </Section>

        <Text style={paragraph}>
          <Link
            href="https://evogueacademy.com/admin/dashboard"
            style={link}
          >
            View in admin dashboard →
          </Link>
        </Text>

        <Hr style={hr} />
        <Text style={footer}>Evogue Academy — automated notification</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `New Enrollment — ${data?.courseName ?? 'Course'}`,
  displayName: 'Enrollment Admin Notification',
  to: 'evogueconsulting@gmail.com',
  previewData: {
    fullName: 'Ada Lovelace',
    studentEmail: 'ada@example.com',
    whatsapp: '+234 800 000 0000',
    country: 'Nigeria',
    studentId: 'EVG-2026-0042',
    courseName: 'Product Management',
    amount: 450,
    currency: 'USD',
    originalAmount: 500,
    discountPercent: 10,
    couponCode: 'EVOGUE10',
    paymentReference: 'FLW-TX-1234567',
    enrolledAt: new Date().toISOString(),
  } satisfies Props,
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: '#0A2E1A',
}
const container = { maxWidth: '560px', margin: '0 auto', padding: '32px 24px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 700,
  color: '#0A2E1A',
  margin: '0 0 12px',
  borderBottom: '2px solid #00F5A0',
  paddingBottom: '10px',
}
const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#0A2E1A',
  margin: '12px 0',
}
const card = {
  backgroundColor: '#F0FDF6',
  borderRadius: '12px',
  padding: '20px',
  margin: '16px 0',
}
const label = {
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: '#1A8C4E',
  margin: '0 0 12px',
}
const row = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#0A2E1A',
  margin: '0 0 6px',
}
const link = { color: '#1A8C4E', textDecoration: 'underline', fontWeight: 600 }
const hr = { borderColor: '#e6f4ec', margin: '24px 0 12px' }
const footer = { fontSize: '12px', color: '#4a6a58', margin: 0 }
