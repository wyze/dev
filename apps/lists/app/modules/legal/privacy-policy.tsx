import { CardContent } from '@wyze/ui/card'

export default function PrivacyPolicyRoute() {
  const date = '2025-08-31'

  return (
    <>
      <title>Privacy Policy · Lists</title>
      <CardContent className="mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="font-bold text-2xl">Privacy Policy</h1>
        <p>
          <strong>Effective Date:</strong> {date}
        </p>
        <p>
          This Privacy Policy describes how Lists collects, uses, and protects
          your personal information.
        </p>
        <h2 className="font-semibold text-xl">1. Information We Collect</h2>
        <ul className="list-inside list-disc">
          <li>
            <strong>Account Information:</strong> Name, email, and password.
          </li>
          <li>
            <strong>Usage Data:</strong> Actions taken in the app (e.g.,
            creating or editing lists).
          </li>
          <li>
            <strong>Device Information:</strong> Browser, device type, IP
            address.
          </li>
        </ul>
        <h2 className="font-semibold text-xl">2. How We Use Information</h2>
        <ul className="list-inside list-disc">
          <li>Provide and improve the Service.</li>
          <li>Communicate with you (e.g., updates, support).</li>
          <li>Protect against fraud, abuse, and misuse.</li>
        </ul>
        <h2 className="font-semibold text-xl">3. Sharing of Information</h2>
        <p>
          We do not sell your personal data. We may share information with
          trusted service providers who assist in operating the Service.
        </p>
        <h2 className="font-semibold text-xl">4. Data Security</h2>
        <p>
          We use reasonable safeguards to protect your data but cannot guarantee
          complete security.
        </p>
        <h2 className="font-semibold text-xl">5. Data Retention</h2>
        <p>
          We retain your data as long as your account is active or as required
          by law.
        </p>
        <h2 className="font-semibold text-xl">6. Cookies</h2>
        <p>
          We use cookies to make Lists work properly and improve your
          experience. These are <strong>first-party cookies</strong> that we set
          directly, and they do not track you across other websites.
        </p>
        <ul className="list-inside list-disc">
          <li>Keep you signed in.</li>
          <li>Remember your preferences (such as theme or language).</li>
          <li>Improve the reliability and security of the Service.</li>
        </ul>
        <p>
          You can control or disable cookies in your browser settings, but some
          features of the Service may not function properly without them.
        </p>
        <h2 className="font-semibold text-xl">7. Your Rights</h2>
        <p>
          Depending on your location, you may have rights to access, update, or
          delete your data. Contact us at{' '}
          <a className="underline" href="mailto:support@wyze.dev">
            support@wyze.dev
          </a>{' '}
          to exercise these rights.
        </p>

        <footer className="border-t pt-6 text-muted-foreground text-sm">
          <p>Last updated: {date}</p>
          <p>
            Contact us at{' '}
            <a className="underline" href="mailto:support@wyze.dev">
              support@wyze.dev
            </a>
          </p>
        </footer>
      </CardContent>
    </>
  )
}
