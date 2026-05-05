import React from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import useConsent from '@features/consent/useConsent';
import InternalLink from '@features/params/InternalLink';

import ExternalLink from '@shared/ui/ExternalLink';

import CreativeCommonsLicense from './CreativeCommonsLicense';

const PageFooter: React.FC = () => {
  const { reset } = useConsent();
  return (
    <footer>
      <span>
        © {new Date().getFullYear()}{' '}
        <ExternalLink href="https://translationcommons.org">Translation Commons</ExternalLink>.
        Docs: <InternalLink page={LangNavPageName.About}>About</InternalLink> |{' '}
        <InternalLink page={LangNavPageName.TermsOfUse}>Terms of Use</InternalLink> |{' '}
        <InternalLink page={LangNavPageName.PrivacyPolicy}>Privacy Policy</InternalLink> |{' '}
        <a
          role="button"
          tabIndex={0}
          onClick={reset}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              reset();
            }
          }}
        >
          Cookie settings
        </a>
        .
      </span>
      <CreativeCommonsLicense />
    </footer>
  );
};

export default PageFooter;
