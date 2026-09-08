import React from 'react';

import DrawerDetailsField from '@widgets/details/ui/DrawerDetailsField';
import DrawerDetailsSection from '@widgets/details/ui/DrawerDetailsSection';

import CommaSeparated from '@shared/ui/CommaSeparated';

import { TerritoryData } from './TerritoryTypes';

type Props = {
  territory: TerritoryData;
};

const TerritoryDrawerIdentity: React.FC<Props> = ({ territory }) => {
  const {
    nameDisplay,
    nameEndonym,
    nameOtherEndonyms,
    nameOtherExonyms,
    ID,
    codeAlpha3,
    codeNumeric,
  } = territory;

  return (
    <DrawerDetailsSection title="Identity">
      <DrawerDetailsField
        label="Endonym"
        expandedContent={
          !!nameOtherEndonyms?.length && (
            <CommaSeparated limit={null}>{nameOtherEndonyms}</CommaSeparated>
          )
        }
      >
        {nameEndonym}
      </DrawerDetailsField>
      <DrawerDetailsField
        label="Name"
        expandedContent={
          !!nameOtherExonyms?.length && (
            <CommaSeparated limit={null}>{nameOtherExonyms}</CommaSeparated>
          )
        }
      >
        {nameDisplay}
      </DrawerDetailsField>
      {ID.match(/^[A-Z]{2}$/) && (
        <DrawerDetailsField
          label="ISO 3166 Code"
          expandedContent={[
            codeAlpha3 && <div>ISO 3166 Alpha-3: {codeAlpha3}</div>,
            codeNumeric && <div>ISO 3166 Numeric: {codeNumeric}</div>,
          ].filter(Boolean)}
        >
          {ID}
        </DrawerDetailsField>
      )}
      {ID.match(/^[0-9]{3}$/) && <DrawerDetailsField label="UN M.49 Code">{ID}</DrawerDetailsField>}
    </DrawerDetailsSection>
  );
};

export default TerritoryDrawerIdentity;
