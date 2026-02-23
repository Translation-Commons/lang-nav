import React from 'react';

import { ObjectType } from '@features/params/PageParamTypes';

import CensusCard from '@entities/census/CensusCard';
import KeyboardCard from '@entities/keyboard/KeyboardCard';
import LanguageCard from '@entities/language/LanguageCard';
import LocaleCard from '@entities/locale/LocaleCard';
import TerritoryCard from '@entities/territory/TerritoryCard';
import { ObjectData } from '@entities/types/DataTypes';
import VariantTagCard from '@entities/varianttag/VariantTagCard';
import WritingSystemCard from '@entities/writingsystem/WritingSystemCard';

const ObjectCard: React.FC<{ object: ObjectData }> = ({ object }) => {
  switch (object.type) {
    case ObjectType.Census:
      return <CensusCard census={object} />;
    case ObjectType.Language:
      return <LanguageCard lang={object} />;
    case ObjectType.Locale:
      return <LocaleCard locale={object} />;
    case ObjectType.Territory:
      return <TerritoryCard territory={object} />;
    case ObjectType.VariantTag:
      return <VariantTagCard data={object} />;
    case ObjectType.WritingSystem:
      return <WritingSystemCard writingSystem={object} />;
    case ObjectType.Keyboard:
      return <KeyboardCard keyboard={object} />;
  }
};

export default ObjectCard;
