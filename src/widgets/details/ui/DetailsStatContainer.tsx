import React from 'react';

function DetailsStatContainer({ children }: React.PropsWithChildren) {
  return <div className="flex gap-8 justify-center">{children}</div>;
}
export default DetailsStatContainer;
