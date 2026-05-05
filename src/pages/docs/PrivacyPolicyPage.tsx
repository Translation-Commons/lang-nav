import React from 'react';

import DocsPageContainer from '@widgets/docs/DocsPageContainer';
import DocsSection from '@widgets/docs/DocsSection';

import ExternalLink from '@shared/ui/ExternalLink';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <DocsPageContainer title="Privacy Policy">
      <div>Last updated: April 2026</div>
      <div>
        Language Navigator (“LangNav”) is an open-source project that provides information about
        languages, writing systems, and their usage. We are committed to protecting your privacy and
        collecting only the data necessary to improve the site. Any non-essential data collection
        takes place only with your consent.
      </div>
      <DocsSection title="Information We Collect">
        <div>
          With your consent, we collect limited information about how visitors use the site.
        </div>
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
      </DocsSection>
      <DocsSection title="How We Use Your Information">
        We use the information we collect to improve our services and personalize your experience on
        our platform. We do not sell or rent your personal information to third parties.
      </DocsSection>
      <DocsSection title="Data Security and Retention">
        We implement reasonable security measures to protect your information from unauthorized
        access, alteration, disclosure, or destruction. We will retain your information for as long
        as necessary to provide our services and comply with legal obligations. We do not retain
        information that can identify individual users.
      </DocsSection>
      <DocsSection title="Third-Party Services">
        <div>
          We may use third-party services to help us operate our business and provide our services.
        </div>
        <div>
          For analytics we use <ExternalLink href="https://amplitude.com/">Amplitude</ExternalLink>,
          which collects data on user interactions to help us understand how the site is used and
          improve it. We only use Amplitude after you have given your consent. If you decline, we do
          not collect analytics data. Amplitude&apos;s privacy policy can be found{' '}
          <ExternalLink href="https://amplitude.com/privacy">here</ExternalLink>.
        </div>
      </DocsSection>
      <DocsSection title="Cookies and Local Storage">
        <div>
          We use your browser&apos;s local storage to remember your preferences and your consent
          choice. We do not use cookies. With your consent, Amplitude also stores anonymous
          identifiers in local storage to help us understand how the site is used.
        </div>
        <div>
          You can withdraw your consent at any time through the <em>Cookie settings</em> link in the
          page footer. When you withdraw consent, we stop collecting analytics data and remove any
          identifiers stored by Amplitude from your browser.
        </div>
      </DocsSection>
      <DocsSection title="Changes to This Privacy Policy">
        We may update this Privacy Policy from time to time. We will notify you of any changes by
        posting the new Privacy Policy on this page. You are advised to review this Privacy Policy
        periodically for any changes.
      </DocsSection>
      <DocsSection title="Contact Us">
        <div>
          If you have any questions about this Privacy Policy, please contact us at{' '}
          <ExternalLink href="mailto:langnav-outreach@translationcommons.org">
            langnav-outreach@translationcommons.org
          </ExternalLink>
          .
        </div>
      </DocsSection>
    </DocsPageContainer>
  );
};

export default PrivacyPolicyPage;
