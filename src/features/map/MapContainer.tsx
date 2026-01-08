import React from 'react';

const MapContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div
      style={{
        alignItems: 'center',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1em',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  );
};

export default MapContainer;
