import { MailIcon, MessageSquareTextIcon } from 'lucide-react';
import { useState } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import PopupCard from '@features/layers/popupcard/PopupCard';

import { getFeedbackEmailBody } from './getFeedbackEmailBody';

const FEEDBACK_EMAIL = 'langnav-outreach@translationcommons.org';
const SURVEY_LINK = 'https://forms.gle/a4Zr2dkdc1TiEAdq6'

export function FeedbackForm() {
  const [type, setType] = useState('General feedback');
  const [message, setMessage] = useState('');

  const handleSurveySubmit = () => {
    window.open(SURVEY_LINK, '_blank')
  }

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
      title="Shape the future of LangNav"
      body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', width: '300px' }}>
          <label style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Tell us about your goals, rate our data, and help us build better futures.</label>
          <HoverableButton
            className={'SurveyButton'}
            onClick={handleSurveySubmit}
            hoverContent={'Submit a Google survey'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em',
            }}
          >
            <MessageSquareTextIcon display="block" size="1em" />
            Take 2-min Survey
          </HoverableButton>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
            <hr style={{ flex: 1 }} />
            <span>OR</span>
            <hr style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Report a specific Issue</label>
          </div>
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
          <HoverableButton
            key="submit"
            buttonType="submit"
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
            <MailIcon display="block" size="1em" />
            Open email
          </HoverableButton>
        </div>
      }
    />
  );
}
