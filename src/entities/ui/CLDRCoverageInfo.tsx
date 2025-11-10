import React from 'react';

import { ObjectType } from '@features/page-params/PageParamTypes';

import { ObjectData } from '@entities/types/DataTypes';

import { toTitleCase } from '@shared/lib/stringUtils';
import Deemphasized from '@shared/ui/Deemphasized';

import { getCLDRCoverageColor } from './CLDRCoverageLevels';

export const ObjectCLDRCoverageLevel: React.FC<{ object: ObjectData }> = ({ object }) => {
  if (object.type !== ObjectType.Language) return null;
  if (object.ID === 'cmn') {
    console.log('Debug cmn coverage', object.cldrCoverage);
  }

  const { cldrCoverage, cldrDataProvider } = object;

  if (!cldrCoverage) {
    if (cldrDataProvider != null) {
      return <ObjectCLDRCoverageLevel object={cldrDataProvider} />;
    } else {
      return <Deemphasized>not in CLDR</Deemphasized>;
    }
  }

  const coverageLevel = cldrCoverage.actualCoverageLevel;
  return (
    <span style={{ color: getCLDRCoverageColor(coverageLevel) }}>{toTitleCase(coverageLevel)}</span>
  );
};

export const ObjectCLDRLocaleCount: React.FC<{ object: ObjectData; verbose?: boolean }> = ({
  object,
  verbose = false,
}) => {
  if (object.type !== ObjectType.Language) return null;

  const { cldrCoverage, cldrDataProvider } = object;

  if (!cldrCoverage) {
    if (cldrDataProvider != null) {
      return <ObjectCLDRLocaleCount object={cldrDataProvider} verbose={verbose} />;
    } else {
      return <Deemphasized>—</Deemphasized>;
    }
  }

  if (!verbose) return cldrCoverage.countOfCLDRLocales.toLocaleString();

  return (
    <div>
      {cldrCoverage.countOfCLDRLocales.toLocaleString()} locale
      {cldrCoverage.countOfCLDRLocales !== 1 ? 's' : ''}
    </div>
  );
};
