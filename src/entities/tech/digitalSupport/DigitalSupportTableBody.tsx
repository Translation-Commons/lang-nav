import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import usePageParams from '@features/params/usePageParams';

import { LanguageData } from '@entities/language/LanguageTypes';

import { cn } from '@shared/lib/utils';
import { Skeleton } from '@shared/ui/skeleton';

import DigitalSupportHoverableCell from './DigitalSupportHoverableCell';
import {
  DigitalSupportCategory,
  DigitalSupportColumn,
  DigitalSupportFactor,
} from './DigitalSupportTypes';

type Props = {
  ents: LanguageData[];
  isPending: boolean;
  visibleColumns: DigitalSupportColumn[];
  showValues: boolean;
};

const DigitalSupportTableBody: React.FC<Props> = ({
  ents,
  isPending,
  visibleColumns,
  showValues,
}) => {
  const { limit } = usePageParams();

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
                  getColumnWidth(showValues, column.showData, column.cat, column.factor),
                )}
              >
                <DigitalSupportHoverableCell ent={ent} {...column} showValues={showValues} />
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
  showValues: boolean,
  showData?: boolean,
  category?: DigitalSupportCategory,
  factor?: DigitalSupportFactor,
) {
  if (!showData) return 'w-0';
  if (showValues) return 'w-20'; // Give enough space for them
  if (category == null) return 'w-32'; // Tier cell
  if (factor == null) return 'w-12'; // Category cell
  return 'w-6';
}

export default DigitalSupportTableBody;
