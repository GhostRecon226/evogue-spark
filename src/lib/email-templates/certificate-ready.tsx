import {
  Body,
  Button,
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
  certId?: string
  issuedAt?: string
  certificateUrl?: string
}

const Email = ({
  fullName = 'there',
  courseName = 'your course',
  certId = 'CERT-XXXXXXXX',
  issuedAt = '',
  certificateUrl = 'https://evogueacademy.com/dashboard/certificate',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Evogue Academy certificate is ready.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar}>
          <Text style={brandText}>Evogue Academy</Text>
        </Section>

        <Heading style={h1}>Your certificate is ready.</Heading>

        <Text style={paragraph}>Hi {fullName},</Text>
        <Text style={paragraph}>
          Congratulations. You have successfully completed{' '}
          <strong>{courseName}</strong> at Evogue Academy.
        </Text>
        <Text style={paragraph}>
          Your certificate is now available in your student dashboard.
        </Text>

        <Section style={card}>
          <Text style={detailRow}>
            <strong>Certificate ID:</strong> {certId}
          </Text>
          {issuedAt ? (
            <Text style={detailRow}>
              <strong>Issued:</strong> {issuedAt}
            </Text>
          ) : null}
        </Section>

        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <Button href={certificateUrl} style={button}>
            Download your certificate
          </Button>
        </Section>

        <Text style={paragraph}>
          Share your achievement on LinkedIn and let the world know what you've
          built.
        </Text>

        <Hr style={hr} />

        <Text style={footerStrong}>Built in Africa. Open to the World.</Text>
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
  subject: 'Your Evogue Academy Certificate is Ready',
  displayName: 'Certificate Ready',
  previewData: {
    fullName: 'Ada Lovelace',
    courseName: 'Product Management',
    certId: 'CERT-9F3A22B1',
    issuedAt: 'June 15, 2026',
    certificateUrl: 'https://evogueacademy.com/dashboard/certificate',
  } satisfies Props,
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: '#0A2E1A',
}
const container = { maxWidth: '560px', margin: '0 auto', padding: '32px 24px' }
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
const detailRow = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#0A2E1A',
  margin: '0 0 6px',
}
const button = {
  backgroundColor: '#0A2E1A',
  color: '#ffffff',
  padding: '12px 22px',
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
}
const link = { color: '#1A8C4E', textDecoration: 'underline' }
const hr = { borderColor: '#e6f4ec', margin: '28px 0 16px' }
const footerStrong = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#0A2E1A',
  margin: '0 0 6px',
}
const footer = {
  fontSize: '13px',
  lineHeight: '1.6',
  color: '#4a6a58',
  margin: 0,
}
