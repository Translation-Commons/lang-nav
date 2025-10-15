import React from 'react';

const Loading: React.FC = () => {
  return (
    <div style={{ height: '100vh', textAlign: 'center', paddingTop: '20vh' }}>
      <h2>Loading...</h2>
      <p>Please wait while the content is being prepared.</p>
    </div>
  );
};

export default Loading;
