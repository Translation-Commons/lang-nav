import { MailIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

import { getFeedbackEmailBody } from './getFeedbackEmailBody';

const FEEDBACK_EMAIL = 'langnav-outreach@translationcommons.org';

interface Props {
  onClose: () => void;
}

export function FeedbackForm({ onClose }: Props) {
  const [type, setType] = useState('General feedback');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    const subject = `[LangNav Feedback] ${type}`;
    const body = getFeedbackEmailBody({ type, message });

    const mailtoUrl =
      `mailto:${FEEDBACK_EMAIL}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '0.75em',
        right: '0.75em',
        zIndex: 9999,
        width: '20em', // 320px
        backgroundColor: 'var(--color-background)',
        borderRadius: '0.5em',
        boxShadow: '0 4px 12px var(--color-shadow)',
        color: 'var(--color-text)',
      }}
    >
      {/* Header */}
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
          <XIcon size="1em" display="block" />
        </HoverableButton>
      </div>

      {/* Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Type</label>
          <select
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
            <option>Bug</option>
            <option>Data issue</option>
            <option>Feature request</option>
            <option>General feedback</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Message</label>
          <textarea
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
      </div>

      {/* Footer */}
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
          disabled={!message.trim()}
          style={{
            backgroundColor: message.trim()
              ? 'var(--color-button-primary)'
              : 'var(--color-button-secondary)',
            color: message.trim() ? 'var(--color-text-on-color)' : 'var(--color-text-secondary)',
            cursor: !message.trim() ? 'not-allowed' : undefined,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em',
          }}
        >
          Open email
          <MailIcon display="block" size="1em" />
        </HoverableButton>
      </div>
    </div>
  );
}
