import { MailIcon } from 'lucide-react';
import { useState } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import PopupCard from '@features/layers/popupcard/PopupCard';

import { getFeedbackEmailBody } from './getFeedbackEmailBody';

const FEEDBACK_EMAIL = 'langnav-outreach@translationcommons.org';

export function FeedbackForm() {
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
    <PopupCard
      buttonLabel="Feedback"
      buttonClassName="primary"
      buttonStyle={{ padding: '0.5em' }}
      description="Submit feedback to the LangNav team"
      title="Send feedback"
      body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', width: '300px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25em' }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25em' }}>
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
      }
      ctas={[
        <HoverableButton
          key="submit"
          role="submit"
          className={message.trim() ? 'primary' : ''}
          onClick={() => message.trim() && handleSubmit()}
          hoverContent={
            message.trim()
              ? 'Open your email client to send this feedback'
              : 'Please enter a message'
          }
          style={{
            backgroundColor: message.trim()
              ? 'var(--color-button-primary)'
              : 'var(--color-button-secondary)',
            color: message.trim() ? 'var(--color-text-on-color)' : 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em',
          }}
        >
          Open email
          <MailIcon display="block" size="1em" />
        </HoverableButton>,
      ]}
    />
  );
}
