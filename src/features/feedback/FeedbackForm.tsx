import { MessageCircleQuestionMarkIcon, MessageSquareTextIcon } from 'lucide-react';

import { Button } from '@shared/ui/button';
import LinkButton from '@shared/ui/LinkButton';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';

import { FeedbackEmailForm } from './FeedbackEmailForm';

const SURVEY_LINK = 'https://forms.gle/a4Zr2dkdc1TiEAdq6';

export function FeedbackForm() {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          aria-label="View settings"
          className="py-2 rounded-md h-full text-md font-light hover:bg-accent/10 "
        >
          <div className="hidden md:inline">Feedback</div>
          <MessageCircleQuestionMarkIcon className="inline md:hidden" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-1 w-[300px] p-4">
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
