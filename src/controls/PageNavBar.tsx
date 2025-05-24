import React, { useState } from 'react';

import { View } from '../types/PageParamTypes';

import ControlsBar from './ControlsBar';
import { usePageParams } from './PageParamsContext';
import ObjectTypeSelector from './selectors/ObjectTypeSelector';
import SearchBar from './selectors/SearchBar';
import ViewSelector from './selectors/ViewSelector';

import './controls.css';

const PageNavBar: React.FC = () => {
  const { view } = usePageParams();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <div className="NavBar">
        <h1>
          <a href="/lang-nav/">
            <strong>Lang</strong>uage <strong>Nav</strong>igator
          </a>
        </h1>
        <ObjectTypeSelector />
        <ViewSelector />
      </div>
      {view !== View.About && (
        <span className="Options">
          <SearchBar />
          {showFilters && <ControlsBar />}
          <div className="selector rounded">
            <button
              className={showFilters ? 'selected' : ''}
              onClick={() => setShowFilters((prev) => !prev)}
            >
              Options {showFilters ? `▲` : `▶`}
            </button>
          </div>
        </span>
      )}
    </div>
  );
};

export default PageNavBar;
