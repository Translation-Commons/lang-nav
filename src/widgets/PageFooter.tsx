import React from 'react';

import CreativeCommonsLicense from './CreativeCommonsLicense';

const PageFooter: React.FC = () => (
  <footer>
    <div>{/* Empty right side for alignment */}</div>
    <p>
      © {new Date().getFullYear()} <a href="https://translationcommons.org">Translation Commons</a>.
      Docs: <a href="about">About</a> | <a href="about#license">License</a> |{' '}
      <a href="privacy">Privacy Policy</a>.
    </p>
    <CreativeCommonsLicense />
  </footer>
);

export default PageFooter;
