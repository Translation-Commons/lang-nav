import { useCallback, useRef } from 'react';
import SVG from 'react-inlinesvg';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import useHoverCard from '@features/hovercard/useHoverCard';

import ObjectCard from '@entities/ui/ObjectCard';

// import CountrySVG from '../../../public/data/wiki/map_countries.svg';

function CountryMap({ highlighted }: { highlighted: Set<string> }) {
  // const [svgText, setSvgText] = useState<string>('');
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();
  // console.log('CountrySVG', CountrySVG);
  const { getTerritory, territories } = useDataContext();

  const buildOnMouseEnter = useCallback(
    (iso: string, g: SVGElement) => (ev: MouseEvent) => {
      const obj = getTerritory(iso);
      if (obj) showHoverCard(<ObjectCard object={obj} />, ev.clientX, ev.clientY);
      g.style.opacity = '0.7';
    },
    [showHoverCard, getTerritory],
  );

  // Load SVG file once
  // useEffect(() => {
  //   fetch('./data/wiki/map_countries.svg')
  //     .then((res) => res.text())
  //     .then(setSvgText);
  // }, []);

  // When highlighted changes, recolor matching paths
  // useEffect(() => {
  //   const svg = svgContainerRef.current?.querySelector('svg');
  //   if (!svg) return;

  //   // Reset all fills
  //   svg.querySelectorAll('path').forEach((p) => p.setAttribute('fill', '#ddd'));

  //   // Highlight selected countries
  //   highlighted.forEach((code) => {
  //     const countryGroup = svg.querySelector(`#${code.toLowerCase()}`);
  //     if (countryGroup) countryGroup.setAttribute('fill', '#f8b400');
  //   });
  // }, [highlighted, svgText]);

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
    <div ref={svgContainerRef}>
      <SVG
        src="./data/wiki/map_countries.svg"
        onLoad={() => {
          const svg = svgContainerRef.current?.querySelector('svg');
          if (!svg) return;

          svg.querySelectorAll('path').forEach((path) => {
            // path.setAttribute('fill', '');
            console.log(path.id, path.classList);
            path.style.fill = '';
            // path.style.fillRule = 'evenodd';
          });

          // svg.querySelectorAll('g').forEach((g) => {
          //   g.addEventListener('mouseenter', handleEnter);
          //   g.addEventListener('mouseleave', handleLeave);
          // });

          // Add hover events to all <g> groups
          territories.forEach((territory) => {
            if (territory.ID.length !== 2) return;

            // Note: not always a group (g), could be a path or other element
            const g = svg.querySelector(`#${territory.ID.toLowerCase()}`);
            if (!g || !(g instanceof SVGElement)) return;
            const onMouseEnter = buildOnMouseEnter(territory.ID, g);

            g.style.fill = 'red';

            g.addEventListener('mouseenter', onMouseEnter);

            g.addEventListener('mouseleave', () => {
              onMouseLeaveTriggeringElement();
              g.style.opacity = '1';
            });
          });

          // svg.querySelectorAll('g').forEach((g) => {
          //   const iso = g
          //     .getAttribute('id')
          //     ?.match(/(?:^|[^a-z])([a-z]{2})(?:$|[^a-z])/)?.[1]
          //     .toUpperCase();
          //   if (!iso) return;

          //   const onMouseEnter = buildOnMouseEnter(iso, g);

          //   g.addEventListener('mouseenter', onMouseEnter);

          //   // g.addEventListener('mouseenter', () => {
          //   //   onHoverCountry?.(iso || null);
          //   //   g.style.opacity = '0.7';
          //   // });

          //   g.addEventListener('mouseleave', () => {
          //     onMouseLeaveTriggeringElement();
          //     g.style.opacity = '1';
          //   });
          // });
        }}
      />
    </div>
  );
}

export default CountryMap;
