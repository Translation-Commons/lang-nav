import React from 'react';

import ObjectTypeSelector from './selectors/ObjectTypeSelector';
import ViewSelector from './selectors/ViewSelector';

import './controls.css';

const PageNavBar: React.FC = () => {
  return (
    <div className="NavBar">
      <h1>
        <a href="/lang-nav/">
          <strong>Lang</strong>uage <strong>Nav</strong>igator
        </a>
      </h1>
      <ObjectTypeSelector />
      <ViewSelector />
    </div>
  );
};

export default PageNavBar;
