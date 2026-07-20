import React, { useEffect, useRef } from 'react';

import usePageParams from '@features/params/usePageParams';

type Props = {
  description?: string;
  variable: string;
};

const ColorSwatch: React.FC<Props> = ({ variable, description }) => {
  const { pageBrightness } = usePageParams().brightness;
  const colorBoxRef = useRef<HTMLDivElement>(null);

  // get the color hex code from the color swatch
  const [colorHex, setColorHex] = React.useState<string>('');
  useEffect(() => {
    // wait a tick to ensure styles are applied
    const timeout = setTimeout(() => {
      if (colorBoxRef.current) {
        const computedStyle = getComputedStyle(colorBoxRef.current);
        const resolvedColorHex = computedStyle.getPropertyValue(variable).trim();
        setColorHex(resolvedColorHex);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [variable, pageBrightness]);

  return (
    <div>
      <div className="mb-1 flex items-center">
        <ColorBox variable={variable} colorBoxRef={colorBoxRef} />
        <div>
          <div className="font-bold">{variable}</div>
          <div>{colorHex}</div>
        </div>
      </div>
      {description && <div>{description}</div>}
    </div>
  );
};

const ColorBox = ({
  variable,
  colorBoxRef,
}: {
  variable: string;
  colorBoxRef: React.Ref<HTMLDivElement>;
}) => {
  return (
    <div
      ref={colorBoxRef}
      className="mr-4 h-20 w-20 shrink-0 rounded-lg border border-muted-foreground"
      style={{ backgroundColor: `var(${variable})` }}
    />
  );
};

export default ColorSwatch;
