import React from 'react';

import DocsPageContainer from '@widgets/docs/DocsPageContainer';
import DocsSection from '@widgets/docs/DocsSection';

import ExternalLink from '@shared/ui/ExternalLink';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <DocsPageContainer title="Privacy Policy">
      <div>Last updated: September 2026</div>
      <div>
        Language Navigator ("LangNav") is an open-source project with information about languages,
        writing systems, and how they&apos;re used. We only collect the data we need to run and
        improve the site, and anything beyond that happens only if you agree to it.
      </div>
      <DocsSection title="Information We Collect">
        <div>
          <strong>Essential visit counts (no consent needed).</strong> While you haven&apos;t agreed
          to analytics, whether you haven&apos;t decided yet or you said no, we still count the page
          you&apos;re on. That&apos;s how we know how much traffic the site gets, even from people
          who opt out. A visit count only holds the page you opened and, if your browser sends one,
          the site you came from. There&apos;s no cookie involved and nothing saved to your browser:
          the ID for that visit lives in memory for that one page load and disappears the moment you
          refresh or open a new tab. Because of that, neither we nor Amplitude (the analytics tool
          described below, which receives these counts) can connect one visit to another from the
          same person. Like any request sent over the internet, this one does reach Amplitude&apos;s
          servers with your IP address attached. We never see or store that ourselves.
        </div>
        <div>
          <strong>Analytics (only with your consent).</strong> If you agree, we collect more about
          how you use the site.
        </div>
        <div>
          This may include:
          <ul className="m-0 list-disc pl-6">
            <li>Pages you visit</li>
            <li>Query parameters and other details in the URL</li>
            <li>General device and browser info</li>
            <li>Roughly which country you&apos;re in</li>
          </ul>
        </div>
        <div>
          We do not collect:
          <ul className="m-0 list-disc pl-6">
            <li>Names</li>
            <li>Email addresses</li>
            <li>Account information</li>
            <li>Anything sensitive</li>
          </ul>
        </div>
      </DocsSection>
      <DocsSection title="How We Use Your Information">
        We use what we collect to improve the site and make it more useful for you. We don&apos;t
        sell or rent your information to anyone.
      </DocsSection>
      <DocsSection title="Data Security and Retention">
        We take reasonable steps to keep your information safe from unauthorized access or misuse.
        We keep it only as long as we need it to run the site and meet any legal requirements, and
        we don&apos;t keep anything that could identify you personally.
      </DocsSection>
      <DocsSection title="Third-Party Services">
        <div>We use a few outside services to help run the site.</div>
        <div>
          For analytics we use <ExternalLink href="https://amplitude.com/">Amplitude</ExternalLink>.
          It collects data on how people use the site so we can understand it and make it better. We
          only send that data to Amplitude if you&apos;ve agreed to it. If you decline, we
          don&apos;t send it. Amplitude also gets the essential visit counts described above. Those
          go out while you haven&apos;t accepted analytics (before you&apos;ve decided, and also if
          you decline), and they carry nothing beyond the page you visited and the site you came
          from. Once you accept, your visits are counted by the full analytics data instead, so each
          visit gets counted once, not both ways. You can read Amplitude&apos;s own privacy policy{' '}
          <ExternalLink href="https://amplitude.com/privacy">here</ExternalLink>.
        </div>
      </DocsSection>
      <DocsSection title="Cookies and Local Storage">
        <div>
          We use your browser&apos;s local storage, not cookies, to remember your preferences and
          your consent choice. If you agree to analytics, Amplitude also stores an anonymous ID in
          local storage so it can tell your visits apart.
        </div>
        <div>
          The essential visit counts don&apos;t use either one. Nothing gets written to a cookie or
          to local storage, just a short-lived ID in memory that&apos;s gone as soon as you reload
          or close the page.
        </div>
        <div>
          You can change your mind anytime using the <em>Cookie settings</em> link in the page
          footer. If you withdraw consent, we stop sending analytics data and clear any ID Amplitude
          stored in your browser. The essential visit counts keep going, since there&apos;s nothing
          stored in your browser to clear.
        </div>
      </DocsSection>
      <DocsSection title="Changes to This Privacy Policy">
        We might update this policy from time to time. When we do, we&apos;ll post the new version
        here, so it&apos;s worth checking back once in a while.
      </DocsSection>
      <DocsSection title="Contact Us">
        <div>
          Questions about this policy? Email us at{' '}
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
