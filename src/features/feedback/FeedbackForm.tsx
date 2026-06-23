import { CheckCircleIcon, SendIcon, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import ZIndex from '@features/layers/ZIndex';

import { submitFeedback } from './submitFeedback';
import { TURNSTILE_SITE_KEY, TurnstileWidget } from './TurnstileWidget';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const FEEDBACK_TYPES = ['Bug', 'Data issue', 'Feature request', 'General feedback'] as const;

interface Props {
  onClose: () => void;
}

export function FeedbackForm({ onClose }: Props) {
  const [type, setType] = useState<string>(FEEDBACK_TYPES[FEEDBACK_TYPES.length - 1]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const location = useLocation();
  const mountPath = useRef(location.pathname);

  // Close the form when the route changes (but not on the initial render)
  useEffect(() => {
    if (location.pathname === mountPath.current) return;
    onClose();
  }, [location.pathname, onClose]);

  // Close the form when the user presses the Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

  return (
    <div
      role="dialog"
      aria-label="Send feedback"
      style={{
        position: 'absolute',
        top: 'calc(100% + 0.5em)',
        right: 0,
        zIndex: ZIndex.FeedbackForm,
        width: '20em',
        backgroundColor: 'var(--color-background)',
        borderRadius: '0.5em',
        boxShadow: '0 4px 12px var(--color-shadow)',
        color: 'var(--color-text)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5em 1em',
          borderBottom: '1px solid var(--color-shadow)',
        }}
      >
        <span style={{ fontWeight: 600 }}>Send feedback</span>
        <HoverableButton onClick={onClose} style={{ padding: '0.5em' }}>
          <XIcon size="1em" display="block" aria-label="Close" />
        </HoverableButton>
      </div>

      {status === 'success' ? (
        <SuccessBody onClose={onClose} />
      ) : (
        <>
          <div style={{ padding: '1em', display: 'flex', flexDirection: 'column', gap: '0.75em' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25em' }}>
              <label
                htmlFor="feedback-type"
                style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}
              >
                Type
              </label>
              <select
                id="feedback-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  padding: '0.5em',
                  border: '1px solid var(--color-shadow)',
                  borderRadius: '0.5em',
                  color: 'var(--color-text)',
                  backgroundColor: 'var(--color-background)',
                }}
              >
                {FEEDBACK_TYPES.map((feedbackType) => (
                  <option key={feedbackType}>{feedbackType}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25em' }}>
              <label
                htmlFor="feedback-message"
                style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}
              >
                Message
              </label>
              <textarea
                id="feedback-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What did you notice or suggest?"
                style={{
                  padding: '0.5em',
                  color: 'var(--color-text)',
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-shadow)',
                  borderRadius: '0.5em',
                  resize: 'vertical',
                }}
              />
            </div>

            {needsTurnstile && <TurnstileWidget onToken={setTurnstileToken} />}

            {status === 'error' && error && (
              <div style={{ color: 'var(--color-red)', fontSize: '0.85em' }}>{error}</div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5em',
              padding: '.5em 1em',
              borderTop: '1px solid var(--color-shadow)',
            }}
          >
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
        </>
      )}
    </div>
  );
}

function SuccessBody({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        padding: '1.5em 1em',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75em',
        textAlign: 'center',
      }}
    >
      <CheckCircleIcon size="2em" color="var(--color-button-primary)" />
      <div style={{ fontWeight: 600 }}>Thanks for your feedback!</div>
      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9em' }}>
        We&apos;ve received your message.
      </div>
      <HoverableButton
        onClick={onClose}
        style={{
          backgroundColor: 'var(--color-button-primary)',
          color: 'var(--color-text-on-color)',
        }}
      >
        Close
      </HoverableButton>
    </div>
  );
}
