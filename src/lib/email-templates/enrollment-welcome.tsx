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
  courseName?: string
  studentId?: string
  courseDuration?: string
  loginEmail?: string
  tempPassword?: string
}

const Email = ({
  fullName = 'there',
  courseName = 'your course',
  studentId = 'EVG-2026-0000',
  courseDuration = '12 weeks',
  loginEmail = 'student@example.com',
  tempPassword = '••••••••',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your place on {courseName} is confirmed.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar}>
          <Text style={brandText}>Evogue Academy</Text>
        </Section>

        <Heading style={h1}>You're in. Welcome to Evogue Academy.</Heading>

        <Text style={paragraph}>Hi {fullName},</Text>
        <Text style={paragraph}>
          Your place on <strong>{courseName}</strong> is confirmed. We're glad
          you're here.
        </Text>

        <Section style={card}>
          <Text style={label}>YOUR DETAILS</Text>
          <Text style={detailRow}>
            <strong>Student ID:</strong> {studentId}
          </Text>
          <Text style={detailRow}>
            <strong>Course:</strong> {courseName}
          </Text>
          <Text style={detailRow}>
            <strong>Duration:</strong> {courseDuration}
          </Text>
        </Section>

        <Section style={card}>
          <Text style={label}>NEXT STEPS</Text>
          <Text style={paragraph}>
            Your login details are below. Use them to access your student
            dashboard where you'll find everything you need before your cohort
            begins.
          </Text>
          <Text style={detailRow}>
            <strong>Login here:</strong>{' '}
            <Link href="https://evogueacademy.com/login" style={link}>
              https://evogueacademy.com/login
            </Link>
          </Text>
          <Text style={detailRow}>
            <strong>Email:</strong> {loginEmail}
          </Text>
          <Text style={detailRow}>
            <strong>Temporary password:</strong>{' '}
            <code style={code}>{tempPassword}</code>
          </Text>
          <Text style={muted}>
            We recommend changing your password after your first login.
          </Text>
        </Section>

        <Text style={paragraph}>
          If you have any questions before your cohort starts, reply to this
          email or reach us on WhatsApp:{' '}
          <Link href="https://wa.me/447404331835" style={link}>
            +44 7404 331835
          </Link>
          .
        </Text>

        <Hr style={hr} />

        <Text style={footerStrong}>Built in Africa. Open to the world.</Text>
        <Text style={footer}>
          The Evogue Academy Team
          <br />
          <Link href="mailto:hello@evogueacademy.com" style={link}>
            hello@evogueacademy.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: "You're in. Welcome to Evogue Academy.",
  displayName: 'Enrollment Welcome',
  previewData: {
    fullName: 'Ada Lovelace',
    courseName: 'Product Management',
    studentId: 'EVG-2026-0042',
    courseDuration: '12 weeks',
    loginEmail: 'ada@example.com',
    tempPassword: 'Evogue!7gK2p',
  } satisfies Props,
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: '#0A2E1A',
}
const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '32px 24px',
}
const brandBar = {
  borderBottom: '2px solid #00F5A0',
  paddingBottom: '12px',
  marginBottom: '24px',
}
const brandText = {
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#0A2E1A',
  margin: 0,
}
const h1 = {
  fontSize: '24px',
  lineHeight: '1.3',
  fontWeight: 700,
  color: '#0A2E1A',
  margin: '0 0 16px',
}
const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#0A2E1A',
  margin: '0 0 12px',
}
const card = {
  backgroundColor: '#F0FDF6',
  borderRadius: '12px',
  padding: '20px',
  margin: '20px 0',
}
const label = {
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: '#1A8C4E',
  margin: '0 0 12px',
}
const detailRow = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#0A2E1A',
  margin: '0 0 6px',
}
const muted = {
  fontSize: '13px',
  lineHeight: '1.5',
  color: '#4a6a58',
  margin: '12px 0 0',
}
const link = { color: '#1A8C4E', textDecoration: 'underline' }
const code = {
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
  backgroundColor: '#ffffff',
  border: '1px solid #d6efe1',
  borderRadius: '6px',
  padding: '2px 6px',
  fontSize: '13px',
}
const hr = { borderColor: '#e6f4ec', margin: '28px 0 16px' }
const footerStrong = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#0A2E1A',
  margin: '0 0 8px',
}
const footer = {
  fontSize: '12px',
  lineHeight: '1.5',
  color: '#4a6a58',
  margin: 0,
}
