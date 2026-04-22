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
      <p>
        © {new Date().getFullYear()}{' '}
        <ExternalLink href="https://translationcommons.org">Translation Commons</ExternalLink>.
        Docs: <InternalLink page={LangNavPageName.About}>About</InternalLink> |{' '}
        <InternalLink page={LangNavPageName.TermsOfUse}>Terms of Use</InternalLink> |{' '}
        <InternalLink page={LangNavPageName.PrivacyPolicy}>Privacy Policy</InternalLink> |{' '}
        <button
          type="button"
          onClick={reset}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'inherit',
            font: 'inherit',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Cookie settings
        </button>
        .
      </p>
      <CreativeCommonsLicense />
    </footer>
  );
};

export default PageFooter;
