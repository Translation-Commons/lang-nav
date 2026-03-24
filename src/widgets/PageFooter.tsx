import React from 'react';
import { Link } from 'react-router';

import CreativeCommonsLicense from './CreativeCommonsLicense';

const PageFooter: React.FC = () => (
  <footer>
    <div>{/* Empty right side for alignment */}</div>
    <p>
      © {new Date().getFullYear()} <a href="https://translationcommons.org">Translation Commons</a>.
      Docs: <Link to="about">About</Link> | <Link to="about#license">License</Link> |{' '}
      <Link to="privacy-policy">Privacy Policy</Link>.
    </p>
    <CreativeCommonsLicense />
  </footer>
);

export default PageFooter;
