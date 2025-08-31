import { CardContent } from '@wyze/ui/card'

export default function AcceptableUseRoute() {
  const date = '2025-08-31'

  return (
    <>
      <title>Acceptable Use · Lists</title>
      <CardContent className="mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="font-bold text-2xl">Acceptable Use Policy</h1>
        <p>
          This Acceptable Use Policy ("Policy") is designed to protect the
          integrity, security, and reliability of Lists. By using the Service,
          you agree to abide by this Policy. Failure to follow these rules may
          result in suspension or termination of your account.
        </p>

        <h2 className="font-semibold text-xl">1. Prohibited Activities</h2>
        <p>You may not use the Service to:</p>
        <ul className="list-inside list-disc">
          <li>Post or share illegal, harmful, or infringing content.</li>
          <li>Harass, abuse, threaten, or discriminate against others.</li>
          <li>Impersonate another person, organization, or entity.</li>
          <li>Distribute malware, viruses, or harmful code.</li>
          <li>Send spam, phishing, or unsolicited messages.</li>
          <li>Infringe intellectual property rights of others.</li>
          <li>Collect or share personal data without consent.</li>
        </ul>

        <h2 className="font-semibold text-xl">
          2. Security and Service Integrity
        </h2>
        <p>To maintain the stability of the Service, you must not:</p>
        <ul className="list-inside list-disc">
          <li>Attempt to gain unauthorized access to accounts or systems.</li>
          <li>Disrupt, overload, or attempt to disable the Service.</li>
          <li>
            Use automated tools (bots, crawlers, scrapers) without permission.
          </li>
          <li>
            Exploit vulnerabilities or attempt to test security without
            authorization.
          </li>
        </ul>

        <h2 className="font-semibold text-xl">3. Enforcement and Reporting</h2>
        <p>
          Violations of this Policy may result in warnings, suspension, or
          permanent termination of your account. We reserve the right to
          investigate and take legal action if necessary.
        </p>
        <p>
          If you become aware of any violations, please report them to us at{' '}
          <a href="mailto:support@wyze.dev" className="underline">
            support@wyze.dev
          </a>
          .
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
