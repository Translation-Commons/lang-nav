import PopupCard from '@features/layers/popupcard/PopupCard';

import { FeedbackForm } from './FeedbackForm';

export function FeedbackButton() {
  return (
    <PopupCard
      buttonLabel="Feedback"
      buttonClassName="primary"
      buttonStyle={{ padding: '0.5em' }}
      description="Send feedback to the LangNav team"
      title="Send feedback"
      body={(close) => <FeedbackForm onClose={close} />}
    />
  );
}
