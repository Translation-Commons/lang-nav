import { useCallback } from 'react';

import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

import Field from '../fields/Field';
import getField from '../fields/getField';
import useNormalizedValues, { NormalizingFunctions } from '../useNormalizedValues';

import { getColorGradientFunction } from './getColorGradientFunction';

type Props = { ents: EntityData[]; colorBy?: Field };

export type ColoringFunctions = NormalizingFunctions & {
  colorBy: Field;
  getColor: (ent: EntityData) => string | undefined;
};

const useColors = ({ ents, colorBy: colorByInput }: Props): ColoringFunctions => {
  const { colorBy: colorByParam, colorGradient } = usePageParams();
  const colorBy = colorByInput ?? colorByParam ?? Field.None;
  const normalizingFunctions = useNormalizedValues({ ents, field: colorBy });

  const applyColorGradient = getColorGradientFunction(colorGradient);
  const { getNormalizedValue } = normalizingFunctions;

  const getColor = useCallback(
    (ent: EntityData): string | undefined => {
      const value = getField(ent, colorBy);
      if (value == null) return undefined; // Will be off the color scale, usually gray

      const num = getNormalizedValue(value);
      if (num == null) return undefined; // have customers handle undefined, eg. gray or transparent
      return applyColorGradient(num);
    },
    [getNormalizedValue, applyColorGradient, colorBy],
  );

  return {
    ...normalizingFunctions,
    colorBy,
    getColor,
  };
};

export default useColors;
