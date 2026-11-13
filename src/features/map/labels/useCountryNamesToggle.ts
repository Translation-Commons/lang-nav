import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';

import { EntityType } from '@entities/types/EntityTypes';

/**
 * Whether this map can name countries, whether the user has them switched on (remembered
 * between visits), and a way to flip that.
 */
function useCountryNamesToggle(isAllowedOnThisMap: boolean) {
  const { entType, fieldFocus, showMapCountryNames, setShowMapCountryNames } = usePageParams();

  // On a map of countries labelled by name, the dots already carry these names.
  const isAvailable =
    isAllowedOnThisMap && !(entType === EntityType.Territory && fieldFocus === Field.Name);

  return {
    isAvailable,
    isShown: isAvailable && showMapCountryNames,
    toggle: () => setShowMapCountryNames(!showMapCountryNames),
  };
}

export default useCountryNamesToggle;
