import React from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import InternalLink from '@features/params/InternalLink';

import { Button } from '@shared/ui/button';
import { Card } from '@shared/ui/card';

import useConsent from './useConsent';

const ConsentBanner: React.FC = () => {
  const { needsDecision, accept, decline } = useConsent();

  if (!needsDecision) return null;

  return (
    <Card
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-[1000] mx-auto flex max-w-2xl flex-col gap-3 border border-border/80 bg-accent/50 px-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm">
        We use analytics to understand how people use this site and improve it. You can accept or
        decline non-essential analytics. Read more in our{' '}
        <InternalLink
          page={LangNavPageName.PrivacyPolicy}
          className="font-medium underline underline-offset-4 hover:text-foreground"
        >
          Privacy Policy
        </InternalLink>
        .
      </p>
      <div className="flex shrink-0 flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={decline}>
          Decline
        </Button>
        <Button type="button" onClick={accept}>
          Accept
        </Button>
      </div>
    </Card>
  );
};

export default ConsentBanner;
