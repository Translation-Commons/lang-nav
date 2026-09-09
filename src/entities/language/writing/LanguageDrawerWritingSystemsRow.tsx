import React from 'react';

import DrawerActionButton from '@widgets/details/ui/DrawerActionButton';
import DrawerDetailsField from '@widgets/details/ui/DrawerDetailsField';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { EntityType, View } from '@features/params/PageParamTypes';

import { sortBy } from '@shared/lib/setUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';

import { LanguageData } from '../LanguageTypes';

type Props = {
  lang: LanguageData;
};

const LanguageDrawerWritingSystemsRow: React.FC<Props> = ({ lang }) => {
  const writingSystems = sortBy(Object.values(lang.writingSystems), (l) =>
    l.ID === lang.primaryWritingSystem?.ID ? 1 : 0,
  );

  if (writingSystems.length === 0) return null;

  if (writingSystems.length === 1)
    return (
      <DrawerDetailsField label="Writing Systems">
        <HoverableEntityName ent={writingSystems[0]} />
      </DrawerDetailsField>
    );

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
