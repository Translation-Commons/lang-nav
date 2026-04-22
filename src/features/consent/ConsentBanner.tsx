import React from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import InternalLink from '@features/params/InternalLink';

import useConsent from './useConsent';

const ConsentBanner: React.FC = () => {
  const { needsDecision, accept, decline } = useConsent();

  if (!needsDecision) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        left: '1rem',
        right: '1rem',
        bottom: '1rem',
        maxWidth: '640px',
        margin: '0 auto',
        padding: '1rem 1.25rem',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-text-secondary)',
        borderRadius: '0.75rem',
        boxShadow: '0 8px 24px var(--color-shadow)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        fontSize: '0.95em',
      }}
    >
      <div>
        We use analytics to understand how people use this site and improve it. You can accept or
        decline non-essential analytics. Read more in our{' '}
        <InternalLink page={LangNavPageName.PrivacyPolicy}>Privacy Policy</InternalLink>.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" onClick={decline}>
          Decline
        </button>
        <button type="button" className="primary" onClick={accept}>
          Accept
        </button>
      </div>
    </div>
  );
};

export default ConsentBanner;
