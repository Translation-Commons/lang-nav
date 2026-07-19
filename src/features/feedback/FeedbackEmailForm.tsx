import { ArrowUpRightIcon, MailIcon } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@shared/lib/utils';
import { buttonVariants } from '@shared/ui/button';
import { Label } from '@shared/ui/label';
import { Textarea } from '@shared/ui/textarea';

import { getFeedbackEmailBody } from './getFeedbackEmailBody';

const FEEDBACK_EMAIL = 'langnav-outreach@translationcommons.org';
const FEEDBACK_TYPES = ['Bug', 'Data issue', 'Feature request', 'General feedback'];

export function FeedbackEmailForm() {
  const [type, setType] = useState('General feedback');
  const [message, setMessage] = useState('');

  const subject = `[LangNav Feedback] ${type}`;
  const body = getFeedbackEmailBody({ type, message });

  const mailtoUrl =
    `mailto:${FEEDBACK_EMAIL}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Report a specific issue</p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feedback-type" className="text-muted-foreground">
          Type
        </Label>
        <select
          id="feedback-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          {FEEDBACK_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feedback-message" className="text-muted-foreground">
          Message
        </Label>
        <Textarea
          id="feedback-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What did you notice or suggest?"
        />
      </div>
      <a
        href={mailtoUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Send us an email!"
        className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
      >
        <MailIcon />
        Open email
        <ArrowUpRightIcon className="opacity-70" />
      </a>
    </div>
  );
}
