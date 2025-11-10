import React from 'react';

import { normalizeAccents } from '@shared/lib/stringUtils';

// Escape regex special characters in the search pattern
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface Props {
  text: string;
  searchPattern: string;
}

const Highlightable: React.FC<Props> = ({ text, searchPattern }) => {
  if (searchPattern === '') {
    return text;
  }

  // Normalize for accent-insensitive matching
  const normalizedText = normalizeAccents(text.toLowerCase());
  const normalizedPattern = normalizeAccents(searchPattern.toLowerCase());
  const safePattern = escapeRegExp(normalizedPattern);

  // \P{L} = non-letter character. Preferred over \s because it works better for unicode characters
  const searchResult = normalizedText.match(
    new RegExp(`(^|.*\\P{L})(${safePattern})(?:(.*\\P{L})(${safePattern}))*?(.*)`, 'iu'),
  );

  if (!searchResult) {
    return text;
  }

  const parts: React.ReactNode[] = [];
  let textPos = 0;

  for (let i = 1; i < searchResult.length; i++) {
    const part = searchResult[i];
    if (!part) continue;

    const originalLength = part.length;
    const originalPart = text.substring(textPos, textPos + originalLength);

    if (i % 2 === 0) {
      parts.push(
        <span key={i} className="highlighted">
          {originalPart}
        </span>,
      );
    } else {
      parts.push(originalPart);
    }

    textPos += originalLength;
  }

  return <>{parts}</>;
};

export default Highlightable;
