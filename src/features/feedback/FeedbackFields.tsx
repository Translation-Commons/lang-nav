import { TURNSTILE_SITE_KEY, TurnstileWidget } from './TurnstileWidget';

export const FEEDBACK_TYPES = ['Bug', 'Data issue', 'Feature request', 'General feedback'] as const;

interface Props {
  type: string;
  message: string;
  error: string | null;
  showError: boolean;
  onTypeChange: (type: string) => void;
  onMessageChange: (message: string) => void;
  onToken: (token: string) => void;
}

export function FeedbackFields({
  type,
  message,
  error,
  showError,
  onTypeChange,
  onMessageChange,
  onToken,
}: Props) {
  const fieldStyle = {
    padding: '0.5em',
    border: '1px solid var(--color-shadow)',
    borderRadius: '0.5em',
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-background)',
  } as const;
  const labelStyle = { fontWeight: 500, color: 'var(--color-text-secondary)' } as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75em', width: '300px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25em' }}>
        <label htmlFor="feedback-type" style={labelStyle}>
          Type
        </label>
        <select
          id="feedback-type"
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          style={fieldStyle}
        >
          {FEEDBACK_TYPES.map((feedbackType) => (
            <option key={feedbackType}>{feedbackType}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25em' }}>
        <label htmlFor="feedback-message" style={labelStyle}>
          Message
        </label>
        <textarea
          id="feedback-message"
          rows={5}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="What did you notice or suggest?"
          style={{ ...fieldStyle, resize: 'vertical' }}
        />
      </div>

      {Boolean(TURNSTILE_SITE_KEY) && <TurnstileWidget onToken={onToken} />}

      {showError && error && (
        <div style={{ color: 'var(--color-red)', fontSize: '0.85em' }}>{error}</div>
      )}
    </div>
  );
}
