import React from 'react';

import { PageContainer, Section } from '@widgets/DocsComponents';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <PageContainer title="Privacy Policy">
      <p>Last updated: March 2026</p>
      <p>
        Language Navigator (“LangNav”) is an open-source project that provides information about
        languages, writing systems, and their usage. We are committed to protecting your privacy and
        collecting only the data necessary to improve the site.
      </p>
      <Section title="Information We Collect">
        <div>We collect limited information about how visitors use the site.</div>
        <div>
          This may include:
          <ul style={{ margin: '0' }}>
            <li>Pages visited</li>
            <li>Query parameters and other URL details</li>
            <li>General device and browser information</li>
            <li>Approximate geographic region (e.g., country-level)</li>
          </ul>
        </div>
        <div>
          We do not collect:
          <ul style={{ margin: '0' }}>
            <li>Names</li>
            <li>Email addresses</li>
            <li>Account information</li>
            <li>Sensitive personal data</li>
          </ul>
        </div>
      </Section>
      <Section title="How We Use Your Information">
        We use the information we collect to improve our services and personalize your experience on
        our platform. We do not sell or rent your personal information to third parties.
      </Section>
      <Section title="Data Security and Retention">
        We implement reasonable security measures to protect your information from unauthorized
        access, alteration, disclosure, or destruction. We will retain your information for as long
        as necessary to provide our services and comply with legal obligations. We do not retain
        information that can identify individual users.
      </Section>
      <Section title="Third-Party Services">
        <div>
          We may use third-party services to help us operate our business and provide our services.
        </div>
        <div>
          For analytics we use <a href="https://amplitude.com/">Amplitude</a>, which collects data
          on user interactions to help us understand how the site is used and improve it.
          Amplitude&apos;s privacy policy can be found{' '}
          <a href="https://amplitude.com/privacy">here</a>.
        </div>
      </Section>
      <Section title="Cookies and Local Storage">
        We use local storage to store user preferences and settings. We do not use cookies or
        commercial tracking tools.
      </Section>
      <Section title="Changes to This Privacy Policy">
        We may update this Privacy Policy from time to time. We will notify you of any changes by
        posting the new Privacy Policy on this page. You are advised to review this Privacy Policy
        periodically for any changes.
      </Section>
      <Section title="Contact Us">
        <div>
          If you have any questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:langnav-outreach@translationcommons.org">
            langnav-outreach@translationcommons.org
          </a>
          .
        </div>
      </Section>
    </PageContainer>
  );
};

export default PrivacyPolicyPage;
