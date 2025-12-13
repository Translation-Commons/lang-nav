import usePageParams from '@features/params/usePageParams';

import { FilterFunctionType } from '../filtering/filter';

import getSubstringFilterOnQuery from './getSubstringFilterOnQuery';

/**
 * Provide a function that returns true for items that match filters based on substrings of their code or name.
 */
export default function getFilterBySubstring(): FilterFunctionType {
  const { searchBy, searchString } = usePageParams();
  if (searchString == '') return () => true;
  return getSubstringFilterOnQuery(searchString, searchBy);
}
