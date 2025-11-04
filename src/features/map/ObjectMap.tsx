import React, { useCallback, useMemo } from 'react';

import { getSliceFunction } from '@features/filtering/filter';
import useHoverCard from '@features/hovercard/useHoverCard';
import { ObjectType } from '@features/page-params/PageParamTypes';

import { LanguageData } from '@entities/language/LanguageTypes';
import { ObjectData } from '@entities/types/DataTypes';

type Props = {
  objects: ObjectData[];
  width?: number; // in pixels
};

const ObjectMap: React.FC<Props> = ({ objects, width = 600 }) => {
  const sliceFunction = getSliceFunction<ObjectData>();
  const renderableObjects: LanguageData[] = useMemo(() => {
    return sliceFunction(
      objects.filter((obj) => obj.type === ObjectType.Language),
    ) as LanguageData[];
  }, [objects, sliceFunction]);
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();

  const buildOnMouseEnter = useCallback(
    (obj: ObjectData) => (e: React.MouseEvent) => {
      showHoverCard(obj.nameDisplay, e.clientX, e.clientY);
    },
    [showHoverCard],
  );

  return (
    <div style={{ width }}>
      <div style={{ position: 'relative' }}>
        <svg
          width="100%"
          height="auto"
          viewBox={`-180 -90 360 180`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            border: '1px solid #ccc',
            backgroundColor: 'var(--color-background)',
            display: 'block',
          }}
        >
          <image
            href="https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/960px-Blue_Marble_2002.png"
            x={-180}
            y={-90}
            width={360}
            height={180}
            preserveAspectRatio="none"
            opacity={0.9}
            pointerEvents="none"
          />
          {renderableObjects.map((obj, idx) => {
            if (obj.latitude == null || obj.longitude == null) {
              return null;
            }
            return (
              <g key={idx}>
                <circle
                  cx={obj.longitude}
                  cy={-obj.latitude}
                  r={3}
                  fill="red"
                  stroke="black"
                  strokeWidth={0.5}
                  onMouseEnter={buildOnMouseEnter(obj)}
                  onMouseLeave={onMouseLeaveTriggeringElement}
                />
                <text
                  x={obj.longitude + 4}
                  y={-obj.latitude + 4}
                  fontSize="3"
                  fill="var(--color-text)"
                  strokeWidth="0.5"
                >
                  {obj.nameDisplay}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Resizer: vertical bar at the right edge to resize the outer container */}
        <div
          role="separator"
          aria-orientation="vertical"
          title="Resize"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = (e as React.MouseEvent).clientX;
            // The structure is: outer <div style={{ width }}> -> this placeholder wrapper -> resizer
            // so climb two levels to reach the outer container whose inline width we want to adjust.
            const outerContainer = (e.currentTarget as HTMLElement).parentElement?.parentElement as
              | HTMLElement
              | undefined;
            const startWidth = outerContainer ? outerContainer.offsetWidth : 600;
            const minWidth = 120;
            const onMove = (ev: MouseEvent) => {
              const delta = ev.clientX - startX;
              const newW = Math.max(minWidth, startWidth + delta);
              if (outerContainer) outerContainer.style.width = `${newW}px`;
            };
            const onUp = () => {
              window.removeEventListener('mousemove', onMove);
              window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
          onTouchStart={(e) => {
            const touch = (e as React.TouchEvent).touches[0];
            if (!touch) return;
            const startX = touch.clientX;
            const outerContainer = (e.currentTarget as HTMLElement).parentElement?.parentElement as
              | HTMLElement
              | undefined;
            const startWidth = outerContainer ? outerContainer.offsetWidth : 600;
            const minWidth = 120;
            const onMove = (ev: TouchEvent) => {
              const t = ev.touches[0];
              if (!t) return;
              const delta = t.clientX - startX;
              const newW = Math.max(minWidth, startWidth + delta);
              if (outerContainer) outerContainer.style.width = `${newW}px`;
            };
            const onEnd = () => {
              window.removeEventListener('touchmove', onMove);
              window.removeEventListener('touchend', onEnd);
              window.removeEventListener('touchcancel', onEnd);
            };
            window.addEventListener('touchmove', onMove, { passive: false });
            window.addEventListener('touchend', onEnd);
            window.addEventListener('touchcancel', onEnd);
          }}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 10,
            cursor: 'col-resize',
            zIndex: 30,
            // Slight visible handle cue; tweak to taste
            background:
              'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0) 100%)',
          }}
        />
      </div>
    </div>
  );
};

export default ObjectMap;
