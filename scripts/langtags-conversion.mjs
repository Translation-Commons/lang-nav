import fs from 'node:fs';

const tagPath = 'public/data/other_sources/langtags.json';
const LangTags = JSON.parse(fs.readFileSync(tagPath, 'utf8'));

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

  output.push(tagCode + '\t' + tagExtraCode.join(';') + '\t' + tagNames.join(';'));
});

fs.writeFileSync('public/data/other_sources/langtags.tsv', output.join('\n'), 'utf-8');
console.log('langtags.json converted to tsv!');
