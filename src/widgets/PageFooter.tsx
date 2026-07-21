import React from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import useConsent from '@features/consent/useConsent';
import InternalLink from '@features/params/InternalLink';

import { Button } from '@shared/ui/button';
import ExternalLink from '@shared/ui/old/ExternalLink';
import { Separator } from '@shared/ui/separator';

import CreativeCommonsLicense from './CreativeCommonsLicense';

const footerLinkClass = 'underline-offset-4 hover:text-foreground hover:underline';

const PageFooter: React.FC = () => {
  const { reset } = useConsent();
  return (
    <footer className="flex w-full flex-col items-center justify-between gap-x-2 gap-y-1 border-t bg-muted px-4 py-1 text-sm text-muted-foreground sm:flex-row">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center sm:justify-start sm:text-left">
        <span>
          © {new Date().getFullYear()}{' '}
          <ExternalLink href="https://translationcommons.org">Translation Commons</ExternalLink>
        </span>
        <span className="font-medium text-foreground">Docs:</span>
        <InternalLink page={LangNavPageName.About} className={footerLinkClass}>
          About
        </InternalLink>
        <Separator orientation="vertical" className="h-4" />
        <InternalLink page={LangNavPageName.TermsOfUse} className={footerLinkClass}>
          Terms of Use
        </InternalLink>
        <Separator orientation="vertical" className="h-4" />
        <InternalLink page={LangNavPageName.PrivacyPolicy} className={footerLinkClass}>
          Privacy Policy
        </InternalLink>
        <Separator orientation="vertical" className="h-4" />
        <Button
          variant="link"
          onClick={reset}
          className={`h-auto p-0 text-sm font-normal text-muted-foreground ${footerLinkClass}`}
        >
          Cookie settings
        </Button>
      </div>
      <CreativeCommonsLicense />
    </footer>
  );
};

export default PageFooter;
