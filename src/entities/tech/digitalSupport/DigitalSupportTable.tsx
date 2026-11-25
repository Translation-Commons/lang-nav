import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';

import { useDigitalSupportContext } from './DigitalSupportContext';
import DigitalSupportTableBody from './DigitalSupportTableBody';
import DigitalSupportTableHeader from './DigitalSupportTableHeader';

type Props = {
  ents: LanguageData[];
  isPending: boolean;
};

const DigitalSupportTable: React.FC<Props> = ({ ents, isPending }) => {
  const { visibleColumns } = useDigitalSupportContext();
  return (
    <div className="max-h-200 max-w-300 truncate overflow-auto relative">
      <table>
        <colgroup>
          <col className="sticky left-0 w-16 bg-background z-15" />
          <col />
          {visibleColumns.map(({ cat }, index) => (
            <col key={index} className={cat == null ? 'border-l-2' : ''} />
          ))}
        </colgroup>
        <DigitalSupportTableHeader />
        <DigitalSupportTableBody ents={ents} isPending={isPending} />
      </table>
    </div>
  );
};

export default DigitalSupportTable;
