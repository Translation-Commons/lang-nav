import React from 'react';

import Deemphasized from '../../generic/Deemphasized';

interface Props {
  value?: string;
}

const LanguageVitalityMeter: React.FC<Props> = ({ value }) => {
  if (!value) {
    return <Deemphasized>Data not available</Deemphasized>;
  }

  // Map Ethnologue vitality levels to meter values (inverted scale)
  // Ethnologue scale: 1=National, 2=Regional, 3=Trade, 4=Educational, 5=Written, 6=Threatened, 7=Shifting, 8=Moribund, 9=Nearly Extinct, 10=Extinct
  // We want: 9=National, 8=Regional, 7=Trade, 6=Educational, 5=Written, 4=Threatened, 3=Shifting, 2=Moribund, 1=Nearly Extinct, 0=Extinct
  const getMeterValue = (vitality: string): number => {
    switch (vitality.toLowerCase()) {
      case 'national':
        return 9;
      case 'regional':
        return 8;
      case 'trade':
        return 7;
      case 'educational':
        return 6;
      case 'written':
        return 5;
      case 'threatened':
        return 4;
      case 'shifting':
        return 3;
      case 'moribund':
        return 2;
      case 'nearly extinct':
        return 1;
      case 'extinct':
        return 0;
      default:
        // For any unknown values, return a neutral value
        return 5;
    }
  };

  const meterValue = getMeterValue(value);

  return (
    <meter
      min={0}
      max={9}
      value={meterValue}
      title={`Vitality: ${value} (${meterValue}/9)`}
      style={{ width: '100%' }}
    />
  );
};

export default LanguageVitalityMeter;
