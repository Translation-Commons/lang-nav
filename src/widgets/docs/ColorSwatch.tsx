import React, { useEffect, useRef } from 'react';

import { usePageBrightness } from '@shared/hooks/usePageBrightness';

type Props = {
  variable: string;
};

const ColorSwatch: React.FC<Props> = ({ variable }) => {
  // get the color code from the color swatch
  const { preference } = usePageBrightness();
  const swatch = useRef<HTMLDivElement>(null);
  const [colorValue, setColorValue] = React.useState<string>('');
  useEffect(() => {
    if (swatch.current) {
      const computedStyle = getComputedStyle(swatch.current);
      const colorValue = computedStyle.getPropertyValue(variable).trim();
      setColorValue(colorValue);
      console.log(`Color value for ${variable}: ${colorValue}`);
    }
  }, [variable, preference]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1em' }}>
      <div
        ref={swatch}
        style={{
          flexShrink: 0,
          width: '5em',
          height: '5em',
          borderRadius: '0.5em',
          border: '1px solid var(--color-text-secondary)',
          backgroundColor: `var(${variable})`,
          marginRight: '1em',
        }}
      />
      <div>
        <div style={{ fontWeight: 'bold' }}>{variable}</div>
        <div>{colorValue}</div>
      </div>
    </div>
  );
};

export default ColorSwatch;
