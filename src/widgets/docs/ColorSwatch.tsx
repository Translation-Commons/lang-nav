import React, { useEffect, useRef } from 'react';

import usePageParams from '@features/params/usePageParams';

type Props = {
  description?: string;
  variable: string;
};

const ColorSwatch: React.FC<Props> = ({ variable, description }) => {
  const { pageBrightness } = usePageParams().brightness;
  const swatch = useRef<HTMLDivElement>(null);

  // get the color hex code from the color swatch
  const [colorHex, setColorHex] = React.useState<string>('');
  useEffect(() => {
    // wait a tick to ensure styles are applied
    const timeout = setTimeout(() => {
      if (swatch.current) {
        const computedStyle = getComputedStyle(swatch.current);
        const resolvedColorHex = computedStyle.getPropertyValue(variable).trim();
        setColorHex(resolvedColorHex);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [variable, pageBrightness]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25em' }}>
        <ColorBox variable={variable} ref={swatch} />
        <div>
          <div style={{ fontWeight: 'bold' }}>{variable}</div>
          <div>{colorHex}</div>
        </div>
      </div>
      {description && <div>{description}</div>}
    </div>
  );
};

const ColorBox = ({ variable, ref }: { variable: string; ref: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      ref={ref}
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
  );
};

export default ColorSwatch;
