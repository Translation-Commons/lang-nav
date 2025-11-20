import React from 'react';

import Hoverable from '@features/hovercard/Hoverable';

const PopulationWarning: React.FC = () => {
  return (
    <Hoverable
      hoverContent={
        <>
          Take this data with a grain of salt. Population data is still in review. Some of the data
          is estimates from adding up other sources (which may or may not disambiguate multilingual
          speakers). We are still working on making valid citations and normalizing the data so
          languages can be properly compared.
        </>
      }
      style={{ fontWeight: 'lighter' }}
    >
      †
    </Hoverable>
  );
};

export default PopulationWarning;
