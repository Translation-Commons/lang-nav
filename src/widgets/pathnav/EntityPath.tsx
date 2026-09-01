import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageSource } from '@entities/language/LanguageTypes';
import { EntityData } from '@entities/types/DataTypes';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@shared/ui/breadcrumb';

import EntityPathChildren from './EntityPathChildren';
import EntityPathParents from './EntityPathParents';

const EntityPath: React.FC<{ ent: EntityData | undefined; showChildren?: boolean }> = ({
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
      case LanguageSource.UNESCO:
      case LanguageSource.BCP:
        // These sources do not support language families
        return null;
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <EntityPathParents ent={ent} />
        <ObjectName ent={ent} />
        {showChildren && <EntityPathChildren ent={ent} />}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

const ObjectName: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  if (!ent) return null;
  return (
    <>
      {ent.type === EntityType.Locale ? (
        <span style={{ fontWeight: 'bold' }}>:</span>
      ) : (
        <BreadcrumbSeparator />
      )}
      <BreadcrumbItem>
        <HoverableEntityName ent={ent} style={{ fontWeight: 'bold' }} />
      </BreadcrumbItem>
    </>
  );
};

export default EntityPath;
