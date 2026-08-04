import React, { useEffect, useRef } from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import useConsent from '@features/consent/useConsent';
import InternalLink from '@features/params/InternalLink';

import ExternalLink from '@shared/ui/ExternalLink';

import CreativeCommonsLicense from './CreativeCommonsLicense';

const PageFooter: React.FC = () => {
  const { reset } = useConsent();
  const footerRef = useRef<HTMLElement>(null);

  // Publish the footer's actual rendered height as a CSS var so the Data page can size its
  // scrollable content area to leave exact room for it, keeping the page itself from scrolling.
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      // getBoundingClientRect, not contentRect, so the border/padding are included -- see the
      // matching comment in PageNavBar.
      const height = el.getBoundingClientRect().height;
      if (height) document.documentElement.style.setProperty('--footer-height', `${height}px`);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={footerRef}>
      <span>
        © {new Date().getFullYear()}{' '}
        <ExternalLink href="https://translationcommons.org">Translation Commons</ExternalLink>.
        Docs: <InternalLink page={LangNavPageName.About}>About</InternalLink> |{' '}
        <InternalLink page={LangNavPageName.TermsOfUse}>Terms of Use</InternalLink> |{' '}
        <InternalLink page={LangNavPageName.PrivacyPolicy}>Privacy Policy</InternalLink> |{' '}
        <a
          role="button"
          tabIndex={0}
          onClick={reset}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              reset();
            }
          }}
        >
          Cookie settings
        </a>
        .
      </span>
      <CreativeCommonsLicense />
    </footer>
  );
};

export default PageFooter;
