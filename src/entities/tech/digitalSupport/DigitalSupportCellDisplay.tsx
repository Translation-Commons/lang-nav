import React from 'react';

const DigitalSupportCellDisplay: React.FC<{ score: number }> = ({ score }) => {
  return (
    <meter
      min={0} // Extinct
      low={3} // Rarely supported -- below this, the meter is colored red
      high={7} // -- below this, the meter is colored yellow
      optimum={8} // Functional just not always fully supported -- tells the renderer that high and above is green
      max={10} // Fully supported
      value={score}
      className="w-full min-w-4"
    />
  );
  {
    /* <DecimalNumber
                  num={getGroupedDigitalSupportFactorScore(ent, tier, cat, factor)}
                /> */
  }
};

export default DigitalSupportCellDisplay;
