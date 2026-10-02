import React from 'react';

import { Spinner } from './spinner';

/** A small spinner pinned to the bottom-right of the screen, for background loading. */
const CornerSpinner: React.FC = () => (
  <div className="fixed bottom-4 right-4 z-50 rounded-full bg-background p-2 shadow-md">
    <Spinner className="size-5" />
  </div>
);

export default CornerSpinner;
