import { useEffect, useRef, useState } from 'react';

import CountrySVG from '../../../public/data/wiki/map_countries.svg';

function CountryMap({ highlighted }: { highlighted: Set<string> }) {
  const [svgText, setSvgText] = useState<string>('');
  const svgContainerRef = useRef<HTMLDivElement>(null);
  console.log('CountrySVG', CountrySVG);

  // Load SVG file once
  useEffect(() => {
    fetch('./data/wiki/map_countries.svg')
      .then((res) => res.text())
      .then(setSvgText);
  }, []);

  // When highlighted changes, recolor matching paths
  useEffect(() => {
    const svg = svgContainerRef.current?.querySelector('svg');
    if (!svg) return;

    // Reset all fills
    svg.querySelectorAll('path').forEach((p) => p.setAttribute('fill', '#ddd'));

    // Highlight selected countries
    highlighted.forEach((code) => {
      const countryGroup = svg.querySelector(`#${code.toLowerCase()}`);
      if (countryGroup) countryGroup.setAttribute('fill', '#f8b400');
    });
  }, [highlighted, svgText]);

  return (
    // <div
    //   ref={svgContainerRef}
    //   className="map-overlay"
    //   dangerouslySetInnerHTML={{ __html: svgText }}
    //   style={{
    //     position: 'absolute',
    //     inset: 0,
    //     pointerEvents: 'none', // let interactions pass through unless you want hover
    //   }}
    // />
    { CountrySVG }
  );
}

export default CountryMap;
