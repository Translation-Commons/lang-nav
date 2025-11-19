import React from 'react';

import { LanguageData, LanguageField } from './LanguageTypes';

const LanguageRetirementReason: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const explanation = lang.warnings?.[LanguageField.isoCode];
  if (!explanation) {
    // If there is no formal ISO retirement, we should check if it never was ISO.

    if (lang.sourceSpecific.ISO.code == null) {
      return <>This languoid was never assigned an ISO 639 code.</>;
    }
    return undefined; // It is not retired and it is part of the ISO standard
  }

  // Extract all parts of the explanation inside brackets ([ and ]) and put them in <code> tags
  // use regex
  const parts = explanation.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          return <code key={index}>{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </>
  );
};

export default LanguageRetirementReason;
