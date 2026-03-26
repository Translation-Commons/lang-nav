import React from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import InternalLink from '@features/params/InternalLink';

import CreativeCommonsLicense from './CreativeCommonsLicense';

const PageFooter: React.FC = () => (
  <footer>
    <div>{/* Empty right side for alignment */}</div>
    <p>
      © {new Date().getFullYear()} <a href="https://translationcommons.org">Translation Commons</a>
      . Docs: <InternalLink page={LangNavPageName.About}>About</InternalLink> |{' '}
      <InternalLink page={LangNavPageName.PrivacyPolicy}>Privacy Policy</InternalLink>.
    </p>
    <CreativeCommonsLicense />
  </footer>
);

export default PageFooter;
