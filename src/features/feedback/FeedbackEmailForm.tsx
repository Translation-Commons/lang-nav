import { MailIcon } from 'lucide-react';
import { useState } from 'react';

import LinkButton from '@shared/ui/LinkButton';

import { getFeedbackEmailBody } from './getFeedbackEmailBody';

const FEEDBACK_EMAIL = 'langnav-outreach@translationcommons.org';

export function FeedbackEmailForm() {
    const [type, setType] = useState('General feedback');
    const [message, setMessage] = useState('');

    const subject = `[LangNav Feedback] ${type}`;
    const body = getFeedbackEmailBody({ type, message });

    const mailtoUrl =
        `mailto:${FEEDBACK_EMAIL}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;


    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Report a specific Issue</label>
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
            <LinkButton href={mailtoUrl} title='Send us an email!'>
                <MailIcon display="block" size="1em" />
                Open email
            </LinkButton>
        </div>
    )


}