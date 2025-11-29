import React from 'react';

import CreativeCommonsLicense from './CreativeCommonsLicense';

const PageFooter: React.FC = () => (
  <footer>
    <div>{/* Empty right side for alignment */}</div>
    <p>
      © {new Date().getFullYear()} <a href="https://translationcommons.org">Translation Commons</a>.
      See <a href={'about#license'}>license</a>, <a href={'about#contact'}>contact info</a>, and
      more in the <a href={'about'}>about page</a>.
    </p>
    <CreativeCommonsLicense />
  </footer>
);

export default PageFooter;
