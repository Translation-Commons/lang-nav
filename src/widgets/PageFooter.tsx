import React from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import useConsent from '@features/consent/useConsent';
import InternalLink from '@features/params/InternalLink';

import ExternalLink from '@shared/ui/ExternalLink';

import CreativeCommonsLicense from './CreativeCommonsLicense';

const PageFooter: React.FC = () => {
  const { reset } = useConsent();

  return (
    <footer className=" shrink-0 w-full overflow-auto p-2 flex flex-row gap-2 text-muted-foreground items-center justify-between border-t-1 text-xs">
      <div>
        © {new Date().getFullYear()}{' '}
        <ExternalLink href="https://translationcommons.org">Translation Commons</ExternalLink>
      </div>
      <div className="text-wrap">
        <InternalLink page={LangNavPageName.About}>About</InternalLink> |{' '}
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
      </div>
      <div>
        <CreativeCommonsLicense />
      </div>
    </footer>
  );
};

export default PageFooter;
