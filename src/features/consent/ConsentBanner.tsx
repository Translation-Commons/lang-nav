import { ChevronDownIcon } from 'lucide-react';
import React from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import InternalLink from '@features/params/InternalLink';

import { Button } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@shared/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@shared/ui/collapsible';

import useConsent from './useConsent';

const ConsentBanner: React.FC = () => {
  const { needsDecision, accept, decline } = useConsent();

  if (!needsDecision) return null;

  return (
    <Card
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl shadow-lg"
    >
      <CardHeader>
        <CardDescription>
          We collect some data to understand how people use this site and improve it. Read more in
          our <InternalLink page={LangNavPageName.PrivacyPolicy}>Privacy Policy</InternalLink>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible>
          <CollapsibleTrigger
            render={
              <Button variant="ghost" size="sm" className="group/trigger -ml-2">
                What counts as essential vs. analytics?
                <ChevronDownIcon
                  data-icon="inline-end"
                  className="transition-transform group-data-[panel-open]/trigger:rotate-180"
                />
              </Button>
            }
          />
          <CollapsibleContent className="flex flex-col gap-2 pt-2 text-xs/relaxed text-muted-foreground">
            <div>
              <strong className="text-foreground">Essential (always on):</strong> an anonymous visit
              count with the page path and referrer. No cookies and no ID that persists between
              visits.
            </div>
            <div>
              <strong className="text-foreground">Analytics (your choice):</strong> page views with
              their filters, searches, sorting and exports, so we can see which features get used.
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline" onClick={decline}>
          Decline
        </Button>
        <Button onClick={accept}>Accept</Button>
      </CardFooter>
    </Card>
  );
};

export default ConsentBanner;
