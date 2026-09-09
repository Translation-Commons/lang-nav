import { MessageCircleQuestionMarkIcon, MessageSquareTextIcon } from 'lucide-react';

import { Button } from '@shared/ui/button';
import LinkButton from '@shared/ui/LinkButton';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';

import { FeedbackEmailForm } from './FeedbackEmailForm';

const SURVEY_LINK = 'https://forms.gle/a4Zr2dkdc1TiEAdq6';

export function FeedbackForm() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Feedback"
            className="gap-1.5 lg:w-auto lg:px-2.5"
          >
            <MessageCircleQuestionMarkIcon />
            <span className="hidden lg:inline">Feedback</span>
          </Button>
        }
      />
      <PopoverContent align="end" className="flex flex-col gap-1 w-[300px] p-4">
        <label>Tell us about your goals, rate our data, and help us build better futures.</label>
        <LinkButton href={SURVEY_LINK} title="Submit a Google survey">
          <MessageSquareTextIcon />
          Take 2-min Survey
        </LinkButton>
        <div className="flex items-center gap-2">
          <hr className="flex-1" />
          <span>OR</span>
          <hr className="flex-1" />
        </div>
        <FeedbackEmailForm />
      </PopoverContent>
    </Popover>
  );
}
