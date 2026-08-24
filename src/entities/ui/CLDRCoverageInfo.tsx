import React from 'react';

import { EntityType } from '@features/params/PageParamTypes';

import { EntityData } from '@entities/types/DataTypes';

import { toTitleCase } from '@shared/lib/stringUtils';
import Deemphasized from '@shared/ui/Deemphasized';

import { getCLDRCoverageColor } from './CLDRCoverageLevels';

export const ObjectCLDRCoverageLevel: React.FC<{ ent: EntityData }> = ({ ent }) => {
  if (ent.type !== EntityType.Language) return null;

  const { coverage, dataProvider } = ent.CLDR;

  if (!coverage) {
    if (dataProvider != null) {
      return <ObjectCLDRCoverageLevel ent={dataProvider} />;
    } else {
      return <Deemphasized>not in CLDR</Deemphasized>;
    }
  }

  const coverageLevel = coverage.actualCoverageLevel;
  return (
    <span style={{ color: getCLDRCoverageColor(coverageLevel) }}>{toTitleCase(coverageLevel)}</span>
  );
};

export const ObjectCLDRLocaleCount: React.FC<{ ent: EntityData; verbose?: boolean }> = ({
  ent,
  verbose = false,
}) => {
  if (ent.type !== EntityType.Language) return null;

  const { coverage, dataProvider } = ent.CLDR;

  if (!coverage) {
    if (dataProvider != null) {
      return <ObjectCLDRLocaleCount ent={dataProvider} verbose={verbose} />;
    } else {
      return <Deemphasized>—</Deemphasized>;
    }
  }

  if (!verbose) return coverage.countOfCLDRLocales.toLocaleString();

  return (
    <div>
      {coverage.countOfCLDRLocales.toLocaleString()} locale
      {coverage.countOfCLDRLocales !== 1 ? 's' : ''}
    </div>
  );
};
