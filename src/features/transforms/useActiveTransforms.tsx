import usePageParams from '@features/params/usePageParams';

import { unique } from '@shared/lib/setUtils';

import Field from './fields/Field';

const useActiveTransforms = (excludeFields: Field[]) => {
  const { colorBy, sortBy, scaleBy, fieldFocus, chartX, chartY } = usePageParams();
  const fields = unique([sortBy, colorBy, scaleBy, fieldFocus, chartX, chartY]).filter(
    (f) => f != Field.None && !excludeFields.includes(f),
  );
  return fields;
};

export default useActiveTransforms;
