import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

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
  return (
    <tbody>
      {ents.map((ent) => (
        <tr key={ent.ID}>
          <td className="pr-1 sticky left-0 w-16 bg-background z-5">{ent.codeDisplay}</td>
          <td className="text-nowrap pr-1 sticky left-16 bg-background z-5">
            <HoverableEntityName ent={ent} />
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
      {ents.length === 0 && !isPending && (
        <tr>
          <td colSpan={2}>No entities found</td>
          <td colSpan={visibleColumns.length}></td>
        </tr>
      )}
      {isPending && (
        <tr>
          <td colSpan={2}>Loading...</td>
          <td colSpan={visibleColumns.length}>
            <Skeleton className="h-4 w-full" />
          </td>
        </tr>
      )}
    </tbody>
  );
};

export default DigitalSupportTableBody;
