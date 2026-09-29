import React from 'react';

import DrawerActionButton from '@widgets/details/ui/DrawerActionButton';
import DrawerDetailsField from '@widgets/details/ui/DrawerDetailsField';

import HoverableEntity from '@features/layers/hovercard/HoverableEntity';
import { View } from '@features/params/PageParamTypes';

import OrthographyCharacters from '@entities/orthography/OrthographyCharacters';
import { EntityType } from '@entities/types/EntityTypes';

import type { LanguageData } from '../LanguageTypes';

type Props = {
  lang: LanguageData;
};

const LanguageDrawerOrthographyRow: React.FC<Props> = ({ lang }) => {
  const orthographies = lang.orthographies;

  if (!orthographies || orthographies.length === 0) return null;

  return (
    <DrawerDetailsField
      label="Orthographies"
      actions={
        orthographies.length > 1 && (
          <DrawerActionButton
            key="table"
            view={View.Table}
            baseParams={{
              entType: EntityType.Orthography,
              entID: lang.ID,
              languageFilter: lang.nameDisplay + ' [' + lang.ID + ']',
              languageScopes: [],
            }}
          />
        )
      }
      expandedContent={
        <table>
          {orthographies.map((orth) => (
            <tr key={orth.ID}>
              <td>
                <HoverableEntity ent={orth}>
                  {orth.writingSystem?.nameDisplay}{' '}
                  {orthographies.some(
                    (o) => o.ID !== orth.ID && o.scriptCode === orth.scriptCode,
                  ) && orth.instance}
                </HoverableEntity>
              </td>
              <td>
                <OrthographyCharacters chars={orth.baseCharacters!} />
              </td>
            </tr>
          ))}
        </table>
      }
    >
      {orthographies.length.toLocaleString()}
    </DrawerDetailsField>
  );
};

export default LanguageDrawerOrthographyRow;
