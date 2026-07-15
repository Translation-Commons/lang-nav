import { MessageSquareTextIcon } from 'lucide-react';

import PopupCard from '@features/layers/popupcard/PopupCard';

import LinkButton from '@shared/ui/LinkButton';

import { FeedbackEmailForm } from './FeedbackEmailForm';

const SURVEY_LINK = 'https://forms.gle/a4Zr2dkdc1TiEAdq6';

export function FeedbackForm() {
  return (
    <PopupCard
      buttonLabel="Feedback"
      buttonClassName="primary"
      buttonStyle={{ padding: '0.5em' }}
      description="Submit feedback to the LangNav team"
      title="Shape the future of LangNav"
      body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25em', width: '300px' }}>
          <label>Tell us about your goals, rate our data, and help us build better futures.</label>
          <LinkButton href={SURVEY_LINK} title="Submit a Google survey">
            <MessageSquareTextIcon display="block" size="1em" />
            Take 2-min Survey
          </LinkButton>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
            <hr style={{ flex: 1 }} />
            <span>OR</span>
            <hr style={{ flex: 1 }} />
          </div>
          <FeedbackEmailForm />
        </div>
      }
    />
  );
}
