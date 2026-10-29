import { ConstructionIcon } from 'lucide-react';
import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';

import { Alert, AlertDescription, AlertTitle } from '@shared/ui/alert';

import getWritingSystemColumns from './WritingSystemColumns';

const WritingSystemTable: React.FC = () => {
  const { writingSystems } = useDataContext();
  const columns = getWritingSystemColumns();

  return (
    <>
      <Alert>
        <ConstructionIcon />
        <AlertTitle>Data not fully integrated</AlertTitle>
        <AlertDescription>
          Population estimates and language/region associations have been developed so far focused
          on language data, the writing system data has clear gaps. Take particular caution when
          interpreting data for constructed writing systems and writing system groups.
        </AlertDescription>
      </Alert>
      <InteractiveEntityTable
        tableID={TableID.WritingSystems}
        ents={writingSystems}
        columns={columns}
      />
    </>
  );
};

export default WritingSystemTable;
