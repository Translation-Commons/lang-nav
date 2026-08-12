import React from 'react';

import { Spinner } from '@shared/ui/spinner';

const LoadingPage: React.FC = () => {
  return (
    <div style={{ height: '100vh', textAlign: 'center', paddingTop: '20vh' }}>
      <h2>
        {/* The heading already announces the loading state, so the spinner is decorative here. */}
        Loading... <Spinner aria-hidden="true" className="inline size-[1em]" />
      </h2>
      <p>Please wait while the content is being prepared.</p>
    </div>
  );
};

export default LoadingPage;
