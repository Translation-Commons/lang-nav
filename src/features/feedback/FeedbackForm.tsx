import { useState } from 'react';

const FEEDBACK_EMAIL = 'your@email.com';

interface Props {
  onClose: () => void;
}

export function FeedbackForm({ onClose }: Props) {
  const [type, setType] = useState('General feedback');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    const subject = `[LangNav Feedback] ${type}`;
    const body = `
Feedback type: ${type}

Message:
${message}

---
Context:
URL: ${window.location.href}
User agent: ${navigator.userAgent}
Time: ${new Date().toISOString()}
`;

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
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontFamily: 'sans-serif',
        fontSize: 14,
        color: '#222',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid #eee',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 15 }}>Send feedback</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 18,
            color: '#888',
            cursor: 'pointer',
            lineHeight: 1,
            padding: '0 2px',
          }}
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontWeight: 500, color: '#555' }}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              padding: '6px 8px',
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 14,
              background: '#fff',
            }}
          >
            <option>Bug</option>
            <option>Data issue</option>
            <option>Feature request</option>
            <option>General feedback</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontWeight: 500, color: '#555' }}>Message</label>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What did you notice or suggest?"
            style={{
              padding: '6px 8px',
              border: '1px solid #ccc',
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
          borderTop: '1px solid #eee',
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: '6px 14px',
            border: '1px solid #ccc',
            borderRadius: 4,
            background: '#fff',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!message.trim()}
          style={{
            padding: '6px 14px',
            border: '1px solid #aaa',
            borderRadius: 4,
            background: message.trim() ? '#1a73e8' : '#e0e0e0',
            color: message.trim() ? '#fff' : '#aaa',
            cursor: message.trim() ? 'pointer' : 'not-allowed',
            fontSize: 13,
          }}
        >
          Open email
        </button>
      </div>
    </div>
  );
}
