import React from 'react';

import Deemphasized from './Deemphasized';

/**
 * This shows a localized version of a number representing a count of people. In cases where
 * the number of people is small, it obfuscates the exact number because accuracy is likely low.
 *
 * If true, displays "≥1", false displays "—", null/undefined displays "—".
 *
 * For numbers:
 *    > 10: displays the rounded number with thousands separator eg. "1,234"
 * 1 to 10: displays "≥1"
 * 0 to  1: displays "—" -- it's probably an artefact from incomplete data
 *   <=  0: displays "0"
 */
const CountOfPeople: React.FC<{ count?: number | boolean | null }> = ({ count }) => {
  if (count == null || count === false) return <Deemphasized>—</Deemphasized>;
  if (count === true || (count >= 1 && count <= 10)) return <Deemphasized>≥1</Deemphasized>;
  if (count <= 0) return <Deemphasized>0</Deemphasized>;
  if (count < 1) return <Deemphasized>—</Deemphasized>;
  return <span>{Math.round(count).toLocaleString()}</span>;
};

export default CountOfPeople;
