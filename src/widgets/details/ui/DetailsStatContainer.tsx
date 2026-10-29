import React from 'react';

function DetailsStatContainer({ children }: React.PropsWithChildren) {
  return <div className="flex gap-4 justify-center flex-col">{children}</div>;
}
export default DetailsStatContainer;
