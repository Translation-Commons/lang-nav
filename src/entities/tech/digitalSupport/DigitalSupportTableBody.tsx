import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import usePageParams from '@features/params/usePageParams';

import { LanguageData } from '@entities/language/LanguageTypes';

import { cn } from '@shared/lib/utils';
import { Skeleton } from '@shared/ui/skeleton';

import { CellDesign, useDigitalSupportContext } from './DigitalSupportContext';
import DigitalSupportHoverableCell from './DigitalSupportHoverableCell';
import { DigitalSupportCategory, DigitalSupportFactor } from './DigitalSupportTypes';

type Props = {
  ents: LanguageData[];
  isPending: boolean;
};

const DigitalSupportTableBody: React.FC<Props> = ({ ents, isPending }) => {
  const { limit } = usePageParams();
  const { visibleColumns, showValues, cellDesign } = useDigitalSupportContext();

  return (
    <tbody>
      {ents.map((ent) => (
        <tr key={ent.ID}>
          <td className="pr-1 sticky left-0 w-16 bg-background z-5">{ent.codeDisplay}</td>
          <td className="pr-1">
            <div className="w-32 truncate overflow-hidden">
              <HoverableEntityName ent={ent} />
            </div>
          </td>
          {visibleColumns.map((column, index) => (
            <td key={index}>
              <div
                className={cn(
                  'truncate transition-[width] duration-1000',
                  getColumnWidth(
                    cellDesign,
                    showValues,
                    column.showData,
                    column.cat,
                    column.factor,
                  ),
                )}
              >
                <DigitalSupportHoverableCell ent={ent} {...column} />
              </div>
            </td>
          ))}
        </tr>
      ))}
      {ents.length === 0 &&
        Array.from({ length: limit }).map((_, index) => (
          <tr key={`loading-${index}`}>
            <td colSpan={2}>{index === 0 && (isPending ? 'Loading...' : 'No entities found')}</td>
            <td colSpan={visibleColumns.length} className="py-1">
              <Skeleton className="h-4 w-full" />
            </td>
          </tr>
        ))}
    </tbody>
  );
};

export function getColumnWidth(
  cellDesign: CellDesign,
  showNumbers: boolean,
  showContents?: boolean,
  category?: DigitalSupportCategory,
  factor?: DigitalSupportFactor,
) {
  if (!showContents) return 'w-0';
  if (cellDesign === CellDesign.Pie || cellDesign === CellDesign.SimplePie) {
    return showNumbers ? 'w-8' : 'w-6';
  } // Always round
  if (showNumbers) return 'w-20'; // Give enough space for them
  if (category == null) return 'w-32'; // Tier cell
  if (factor == null) return 'w-12'; // Category cell
  return 'w-6';
}

export default DigitalSupportTableBody;
