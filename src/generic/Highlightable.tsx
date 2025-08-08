import React from 'react';

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

  const safePattern = escapeRegExp(searchPattern);
  // \P{L} = non-letter character. Preferred over \s because it works better for unicode characters
  const searchResult = text.match(
    new RegExp(`(^|.*\\P{L})(${safePattern})(?:(.*\\P{L})(${safePattern}))*?(.*)`, 'iu'),
  );

  return searchResult ? (
    <>
      {searchResult.slice(1).map((part, i) =>
        i % 2 === 0 ? (
          part
        ) : (
          <span key={i} className="highlighted">
            {part}
          </span>
        ),
      )}
    </>
  ) : (
    text
  );
};

export default Highlightable;
