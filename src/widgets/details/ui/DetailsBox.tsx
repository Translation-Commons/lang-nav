import React from 'react';

// Candidate for deletion
function DetailsBox({ children }: React.PropsWithChildren) {
  return <div className="grow shrink basis-[200px]">{children}</div>;
}
export default DetailsBox;
