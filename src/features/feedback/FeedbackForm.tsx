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
        top: 12,
        right: 12,
        zIndex: 9999,
        width: 320,
        background: 'var(--color-background)',
        borderRadius: 8,
        boxShadow: '0 4px 12px var(--color-shadow)',
        fontFamily: 'sans-serif',
        fontSize: 14,
        color: 'var(--color-text)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-shadow)',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 15 }}>Send feedback</span>
        <HoverableButton
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 18,
            color: 'var(--color-text-secondary)',
            lineHeight: 1,
            padding: '0 2px',
          }}
        >
          ×
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
              padding: '6px 8px',
              border: '1px solid var(--color-shadow)',
              borderRadius: 4,
              fontSize: 14,
              background: 'var(--color-background)',
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
              padding: '6px 8px',
              border: '1px solid var(--color-shadow)',
              borderRadius: 4,
              fontSize: 14,
              resize: 'vertical',
              fontFamily: 'sans-serif',
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          padding: '10px 16px',
          borderTop: '1px solid var(--color-shadow)',
        }}
      >
        <HoverableButton
          onClick={onClose}
          style={{
            padding: '6px 14px',
            borderRadius: 4,
            background: 'var(--color-button-secondary)',
            fontSize: 13,
          }}
        >
          Cancel
        </HoverableButton>
        <HoverableButton
          onClick={handleSubmit}
          disabled={!message.trim()}
          style={{
            padding: '6px 14px',
            borderRadius: 4,
            background: message.trim()
              ? 'var(--color-button-primary)'
              : 'var(--color-button-secondary)',
            color: message.trim() ? '#fff' : 'var(--color-text-secondary)',
            cursor: !message.trim() ? 'not-allowed' : undefined,
            fontSize: 13,
          }}
        >
          Open email
        </HoverableButton>
      </div>
    </div>
  );
}
