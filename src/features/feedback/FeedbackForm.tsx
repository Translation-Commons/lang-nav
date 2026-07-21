import { ArrowUpRightIcon, MessageSquareTextIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@shared/lib/utils';
import { Button, buttonVariants } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@shared/ui/popover';
import { Separator } from '@shared/ui/separator';

import { FeedbackEmailForm } from './FeedbackEmailForm';

const SURVEY_LINK = 'https://forms.gle/a4Zr2dkdc1TiEAdq6';

// Only these reasons close the popover; interactions inside it (typing, selecting,
// clicking the mailto link) must not dismiss it.
const EXPLICIT_DISMISSALS = new Set<string>(['escape-key', 'outside-press', 'trigger-press']);

export function FeedbackForm({ triggerClassName }: { triggerClassName?: string } = {}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen, eventDetails) => {
        if (nextOpen) {
          setOpen(true);
        } else if (EXPLICIT_DISMISSALS.has(eventDetails.reason)) {
          setOpen(false);
        }
      }}
    >
      <PopoverTrigger
        className={triggerClassName ?? 'inline-flex items-center rounded-md px-2.5 py-1 text-base'}
        title="Submit feedback to the LangNav team"
      >
        Feedback
      </PopoverTrigger>
      <PopoverContent align="end" className="w-90">
        <div className="flex items-center justify-between p-0">
          <PopoverTitle className="text-lg my-1 font-normal">
            Shape the future of LangNav
          </PopoverTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            <XIcon />
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Tell us about your goals, rate our data, and help us build better futures.
          </p>
          <a
            href={SURVEY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            title="Submit a Google survey"
            className={cn(buttonVariants(), 'w-full')}
          >
            <MessageSquareTextIcon />
            Take 2-min Survey
            <ArrowUpRightIcon className="opacity-70" />
          </a>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Separator className="flex-1" />
            OR
            <Separator className="flex-1" />
          </div>
          <FeedbackEmailForm />
        </div>
      </PopoverContent>
    </Popover>
  );
}
