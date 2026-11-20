import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import usePageParams from '@features/params/usePageParams';

import { LanguageData } from '@entities/language/LanguageTypes';

import { cn } from '@shared/lib/utils';
import { Skeleton } from '@shared/ui/skeleton';

import DigitalSupportHoverableCell from './DigitalSupportHoverableCell';
import { DigitalSupportColumn } from './DigitalSupportTypes';

type Props = {
  ents: LanguageData[];
  isPending: boolean;
  visibleColumns: DigitalSupportColumn[];
};

const DigitalSupportTableBody: React.FC<Props> = ({ ents, isPending, visibleColumns }) => {
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
            <td key={index} className="">
              <div
                className={cn(
                  'truncate transition-w duration-1000',
                  !column.showData ? 'w-0' : 'w-20',
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

export default DigitalSupportTableBody;
