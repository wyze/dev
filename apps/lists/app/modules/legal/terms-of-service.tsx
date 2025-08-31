import { CardContent } from '@wyze/ui/card'

export default function TermsOfServiceRoute() {
  const date = '2025-08-31'

  return (
    <>
      <title>Terms of Service · Lists</title>
      <CardContent className="mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="font-bold text-2xl">Terms of Service</h1>
        <p>
          <strong>Effective Date:</strong> {date}
        </p>
        <p>
          Welcome to Lists ("we," "our," or "us"). By accessing or using our
          services (the "Service"), you agree to these Terms of Service.
        </p>
        <h2 className="font-semibold text-xl">1. Eligibility</h2>
        <p>
          You must be at least 13 years old (or the minimum age required in your
          country) to use the Service.
        </p>
        <h2 className="font-semibold text-xl">2. Account Registration</h2>
        <p>
          You agree to provide accurate and complete information when creating
          an account and to keep this information up to date. You are
          responsible for maintaining the confidentiality of your login
          credentials.
        </p>
        <h2 className="font-semibold text-xl">3. Use of the Service</h2>
        <ul className="list-inside list-disc">
          <li>Use the Service for unlawful purposes.</li>
          <li>Attempt to disrupt or harm the Service or its infrastructure.</li>
          <li>
            Copy, resell, or reverse-engineer the Service without permission.
          </li>
        </ul>
        <h2 className="font-semibold text-xl">4. Content</h2>
        <p>
          You retain all rights to the content you create using the Service. By
          using the Service, you grant us a limited license to store, process,
          and display your content solely for the operation of the Service.
        </p>
        <h2 className="font-semibold text-xl">5. Termination</h2>
        <p>
          We may suspend or terminate your account if you violate these Terms.
        </p>
        <h2 className="font-semibold text-xl">6. Limitation of Liability</h2>
        <p>
          The Service is provided “as is” without warranties of any kind. We are
          not liable for damages arising from use of the Service.
        </p>
        <h2 className="font-semibold text-xl">7. Governing Law</h2>
        <p>These Terms are governed by the laws of Illinois.</p>

        <footer className="border-t pt-6 text-muted-foreground text-sm">
          <p>Last updated: {date}</p>
          <p>
            Contact us at{' '}
            <a className="underline" href="mailto:me@wyze.dev">
              me@wyze.dev
            </a>
          </p>
        </footer>
      </CardContent>
    </>
  )
}
