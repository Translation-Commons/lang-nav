import React from 'react';

function DetailsRow({ children }: React.PropsWithChildren) {
  return <div className="flex flex-wrap gap-4 items-stretch mb-4">{children}</div>;
}
export default DetailsRow;
