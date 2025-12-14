import React from 'react';

import { TerritoryData } from '@entities/types/DataTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';

const TerritoryIdentification: React.FC<{ territory: TerritoryData }> = ({ territory }) => {
  const {
    ID,
    codeAlpha3,
    codeNumeric,
    nameDisplay,
    nameEndonym,
    nameOtherEndonyms,
    nameOtherExonyms,
  } = territory;

  return (
    <DetailsSection title="Identification">
      <DetailsField
        title={
          ID.match(/^[A-Z]{2}$/)
            ? 'ISO-3166 Alpha-2 Code:'
            : ID.match(/^[0-9]{3}$/)
              ? 'UN M.49 Numeric Code:'
              : 'Territory ID:'
        }
      >
        {ID}
      </DetailsField>
      {codeAlpha3 && <DetailsField title="ISO-3166 Alpha-3 Code:">{codeAlpha3}</DetailsField>}
      {codeNumeric && <DetailsField title="ISO-3166 Numeric Code:">{codeNumeric}</DetailsField>}
      <DetailsField title="Display Name:">{nameDisplay}</DetailsField>
      {nameEndonym && <DetailsField title="Endonym:">{nameEndonym}</DetailsField>}
      {nameOtherEndonyms && nameOtherEndonyms.length > 0 && (
        <DetailsField title="Other Endonyms:">{nameOtherEndonyms.join(', ')}</DetailsField>
      )}
      {nameOtherExonyms && nameOtherExonyms.length > 0 && (
        <DetailsField title="Other Names:">{nameOtherExonyms.join(', ')}</DetailsField>
      )}
    </DetailsSection>
  );
};

export default TerritoryIdentification;
