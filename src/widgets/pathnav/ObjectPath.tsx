import { SlashIcon } from 'lucide-react';
import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageSource } from '@entities/language/LanguageTypes';
import { EntityData } from '@entities/types/DataTypes';

import ObjectPathChildren from './ObjectPathChildren';
import ObjectPathParents from './ObjectPathParents';

const ObjectPath: React.FC<{ ent: EntityData | undefined; showChildren?: boolean }> = ({
  ent,
  showChildren = true,
}) => {
  const { languageSource } = usePageParams();
  if (!ent) return null;
  if (ent.type === EntityType.Language) {
    // Not all language sources have parent/child data
    switch (languageSource) {
      case LanguageSource.Combined:
      case LanguageSource.Glottolog:
      case LanguageSource.ISO:
        break; // These all have parent/child data, continue
      case LanguageSource.CLDR:
      case LanguageSource.Ethnologue:
      case LanguageSource.UNESCO:
      case LanguageSource.BCP:
        // These sources do not support language families
        return null;
    }
  }

  return (
    <>
      <ObjectPathParents ent={ent} />
      <ObjectName ent={ent} />
      {showChildren && <ObjectPathChildren ent={ent} />}
    </>
  );
};

const ObjectName: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  if (!ent) return null;
  return (
    <>
      {ent.type === EntityType.Locale ? (
        <span style={{ fontWeight: 'bold' }}>:</span>
      ) : (
        <SlashIcon size="1em" />
      )}
      <HoverableObjectName ent={ent} style={{ fontWeight: 'bold' }} />
    </>
  );
};

export default ObjectPath;
