import { SendIcon } from 'lucide-react';
import { useState } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

import { FeedbackFields, FEEDBACK_TYPES } from './FeedbackFields';
import { FeedbackSuccess } from './FeedbackSuccess';
import { submitFeedback } from './submitFeedback';
import { TURNSTILE_SITE_KEY } from './TurnstileWidget';

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface Props {
  onClose: () => void;
}

export function FeedbackForm({ onClose }: Props) {
  const [type, setType] = useState<string>(FEEDBACK_TYPES[FEEDBACK_TYPES.length - 1]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');

  const needsTurnstile = Boolean(TURNSTILE_SITE_KEY);
  const canSubmit =
    message.trim().length > 0 &&
    status !== 'submitting' &&
    (!needsTurnstile || turnstileToken.length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus('submitting');
    setError(null);
    try {
      await submitFeedback({
        type,
        message: message.trim(),
        turnstileToken: turnstileToken || undefined,
      });
      setStatus('success');
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') return <FeedbackSuccess onClose={onClose} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
      <FeedbackFields
        type={type}
        message={message}
        error={error}
        showError={status === 'error'}
        onTypeChange={setType}
        onMessageChange={setMessage}
        onToken={setTurnstileToken}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5em' }}>
        <HoverableButton
          onClick={onClose}
          style={{ backgroundColor: 'var(--color-button-secondary)' }}
        >
          Cancel
        </HoverableButton>
        <HoverableButton
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            backgroundColor: canSubmit
              ? 'var(--color-button-primary)'
              : 'var(--color-button-secondary)',
            color: canSubmit ? 'var(--color-text-on-color)' : 'var(--color-text-secondary)',
            cursor: !canSubmit ? 'not-allowed' : undefined,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em',
          }}
        >
          {status === 'submitting' ? 'Sending...' : 'Send'}
          <SendIcon display="block" size="1em" />
        </HoverableButton>
      </div>
    </div>
  );
}
