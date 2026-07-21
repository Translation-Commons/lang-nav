import React, { useEffect, useRef, useState } from 'react';

export const useAutoAdjustedWidth = (
  value: string,
): {
  CalculateWidthFromHere: React.ReactNode;
  width: number;
} => {
  const endCapRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(50);

  // Used to calculate the width of the input box
  useEffect(() => {
    if (endCapRef.current) {
      setWidth(endCapRef.current.offsetWidth + 10); // add some buffer
    }
  }, [value]);

  const CalculateWidthFromHere = (
    <span ref={endCapRef} className="absolute invisible whitespace-pre [font:inherit]">
      {value || ' '}
    </span>
  );

  return { CalculateWidthFromHere, width };
};
