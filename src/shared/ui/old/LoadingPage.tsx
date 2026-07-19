import React from 'react';

import LoadingIcon from '@shared/ui/old/LoadingIcon';

const LoadingPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-[20vh] text-center">
      <h2 className="inline-flex items-center gap-2">
        Loading... <LoadingIcon />
      </h2>
      <p>Please wait while the content is being prepared.</p>
    </div>
  );
};

export default LoadingPage;
