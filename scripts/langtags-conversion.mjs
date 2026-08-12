// How to run:
//   1. If refreshing the source data, re-download the latest version to
//      public/data/other_sources/langtags.json from:
//      https://ldml.api.sil.org/langtags.json
//   2. From the project root, run:
//      node scripts/convertLangTagsToTsv.mjs
//   3. This overwrites public/data/other_sources/langtags.tsv.
//   4. Spot-check the output — eg. confirm a language you know (like "spa")
//      still has its expected names, and that duplicate rows were removed.
//
// Docs on the langtags.json format: https://github.com/silnrsi/langtags/blob/master/doc/langtags.md

import fs from 'node:fs';

const tagPath = 'public/data/other_sources/langtags.json';
const LangTags = JSON.parse(fs.readFileSync(tagPath, 'utf8'));

// src/shared/lib/setUtils.ts's uniqueBy. Duplicated locally so this script
// has no dependency on the TS setup.
function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const output = [];
output.push(
  '# Source: https://ldml.api.sil.org/langtags.json (SIL langtags dataset, public domain)',
);
output.push('# Docs: https://github.com/silnrsi/langtags/blob/master/doc/langtags.md');
output.push('iso639_3\tiso639_3extra\tnames');

LangTags.forEach((LangTag) => {
  const tagCode = LangTag.iso639_3;
  if (tagCode === undefined) return;

  const tagExtraCode = LangTag.iso639_3extra ?? [];
  const tagNames = Array.isArray(LangTag.names) ? LangTag.names : [];

  if (tagNames.length > 0 || tagExtraCode.length > 0)
    output.push(tagCode + '\t' + tagExtraCode.join(';') + '\t' + tagNames.join(';'));
});

fs.writeFileSync(
  'public/data/other_sources/langtags.tsv',
  uniqueBy(output, (line) => line).join('\n'),
  'utf-8',
);
console.log('langtags.json converted to tsv!');
