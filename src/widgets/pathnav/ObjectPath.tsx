import { SlashIcon } from 'lucide-react';
import React from 'react';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageSource } from '@entities/language/LanguageTypes';
import { ObjectData } from '@entities/types/DataTypes';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@shared/ui/breadcrumb';

import ObjectPathChildren from './ObjectPathChildren';
import ObjectPathParents from './ObjectPathParents';

const ObjectPath: React.FC<{ object: ObjectData | undefined; showChildren?: boolean }> = ({
  object,
  showChildren = true,
}) => {
  const { languageSource } = usePageParams();
  if (!object) return null;
  if (object.type === ObjectType.Language) {
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
    <Breadcrumb>
      <BreadcrumbList>
        <ObjectPathParents object={object} />
        <BreadcrumbSeparator>
          {object.type === ObjectType.Locale ? (
            <span className="font-bold text-foreground">:</span>
          ) : (
            <SlashIcon size="1em" />
          )}
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage className="font-bold">{object.nameDisplay}</BreadcrumbPage>
        </BreadcrumbItem>
        {showChildren && <ObjectPathChildren object={object} />}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default ObjectPath;
