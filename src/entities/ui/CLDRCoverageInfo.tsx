import React from 'react';

import { ObjectType } from '@features/page-params/PageParamTypes';

import { ObjectData } from '@entities/types/DataTypes';

import { toTitleCase } from '@shared/lib/stringUtils';
import Deemphasized from '@shared/ui/Deemphasized';

import { getCLDRCoverageColor } from './CLDRCoverageLevels';

export const ObjectCLDRCoverageLevel: React.FC<{ object: ObjectData }> = ({ object }) => {
  if (object.type !== ObjectType.Language) return null;

  const { coverage, dataProvider } = object.CLDR;

  if (!coverage) {
    if (dataProvider != null) {
      return <ObjectCLDRCoverageLevel object={dataProvider} />;
    } else {
      return <Deemphasized>not in CLDR</Deemphasized>;
    }
  }

  const coverageLevel = coverage.actualCoverageLevel;
  return (
    <span style={{ color: getCLDRCoverageColor(coverageLevel) }}>{toTitleCase(coverageLevel)}</span>
  );
};

export const ObjectCLDRLocaleCount: React.FC<{ object: ObjectData; verbose?: boolean }> = ({
  object,
  verbose = false,
}) => {
  if (object.type !== ObjectType.Language) return null;

  const { coverage, dataProvider } = object.CLDR;

  if (!coverage) {
    if (dataProvider != null) {
      return <ObjectCLDRLocaleCount object={dataProvider} verbose={verbose} />;
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
