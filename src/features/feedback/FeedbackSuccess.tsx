import { CheckCircleIcon } from 'lucide-react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

export function FeedbackSuccess({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        padding: '0.5em',
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
