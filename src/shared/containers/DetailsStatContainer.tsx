import React from 'react';

const DetailsStatContainer: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div
    style={{
      display: 'flex',
      gap: '2em',
      marginTop: 'auto',
      paddingBottom: '0.5em',
      justifyContent: 'center',
    }}
  >
    {children}
  </div>
);

export default DetailsStatContainer;
