import React from 'react';

import Hoverable from '../../generic/Hoverable';

const PopulationWarning: React.FC = () => {
  return (
    <Hoverable
      hoverContent={
        <>
          Take this data with a grain of salt. Population data is still in review. It should have
          valid citation and be normalized so languages can be properly compared.
        </>
      }
      style={{ fontWeight: 'lighter' }}
    >
      †
    </Hoverable>
  );
};

export default PopulationWarning;
