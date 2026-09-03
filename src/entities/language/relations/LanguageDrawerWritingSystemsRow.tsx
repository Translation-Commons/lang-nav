import React from 'react';

import DrawerActionButton from '@widgets/details/ui/DrawerActionButton';
import { DrawerDetailsField } from '@widgets/details/ui/DrawerDetailsSection';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { EntityType, View } from '@features/params/PageParamTypes';

import { LanguageData } from '@entities/language/LanguageTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

type Props = {
  lang: LanguageData;
};

const LanguageDrawerWritingSystemsRow: React.FC<Props> = ({ lang }) => {
  const writingSystems = Object.values(lang.writingSystems);

  if (writingSystems.length === 0) return null;

  return (
    <DrawerDetailsField
      label="Writing Systems"
      actions={
        writingSystems.length > 1 && (
          <DrawerActionButton
            key="table"
            view={View.Table}
            baseParams={{
              entType: EntityType.WritingSystem,
              entID: lang.ID,
              languageFilter: lang.nameDisplay + ' [' + lang.ID + ']',
              languageScopes: [],
            }}
          />
        )
      }
      expandedContent={
        <CommaSeparated limit={12}>
          {writingSystems.map((ws) => (
            <HoverableEntityName key={ws.ID} ent={ws} />
          ))}
        </CommaSeparated>
      }
    >
      <HoverableEntityName ent={writingSystems[0]} />
      {writingSystems.length > 1 ? ` + ${writingSystems.length - 1} more` : ''}
    </DrawerDetailsField>
  );
};

export default LanguageDrawerWritingSystemsRow;
