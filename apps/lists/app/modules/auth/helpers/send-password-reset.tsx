import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { Resend } from 'resend'
import type { Env } from 'workers/app'

import logo from '~/assets/logo.png'

let resend: Resend

export async function sendResetPassword(
  env: Env,
  { user, url }: { user: { email: string; name: string }; url: string },
) {
  if (!resend) {
    resend = new Resend(env.RESEND_API_KEY)
  }

  return resend.emails.send({
    from: 'Lists Support <support@lists.wyze.dev>',
    subject: 'Password reset link',
    to: [user.email],
    react: (
      <Html>
        <Head />
        <Body style={main}>
          <Preview>Reset your password for Lists</Preview>
          <Container style={container}>
            <Img src={logo} width="40" height="33" alt="Lists" />
            <Section>
              <Text style={text}>Hi {user.name.split(' ').at(0)},</Text>
              <Text style={text}>
                Someone recently requested a password change for your Lists
                account. If this was you, you can set a new password here:
              </Text>
              <Button style={button} href={url}>
                Reset password
              </Button>
              <Text style={text}>
                If you don&apos;t want to change your password or didn&apos;t
                request this, just ignore and delete this message.
              </Text>
              <Text style={text}>
                To keep your account secure, please don&apos;t forward this
                email to anyone. See our Help Center for{' '}
                <Link style={anchor} href={url}>
                  more security tips.
                </Link>
              </Text>
              <Text style={text}>Happy Listing!</Text>
            </Section>
          </Container>
        </Body>
      </Html>
    ),
  })
}

const main = {
  backgroundColor: '#f6f9fc',
  padding: '10px 0',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '45px',
}

const text = {
  fontSize: '16px',
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: '300',
  color: '#404040',
  lineHeight: '26px',
}

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '4px',
  color: '#fff',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
}

const anchor = {
  textDecoration: 'underline',
}
