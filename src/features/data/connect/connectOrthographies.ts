import { LanguageDictionary } from '@entities/language/LanguageTypes';
import { OrthographyData } from '@entities/orthography/OrthographyTypes';
import { ScriptCode, WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export function connectOrthographies(
  languages: LanguageDictionary,
  writingSystems: Record<ScriptCode, WritingSystemData>,
  orthographies: OrthographyData[],
): void {
  const missingLocales: string[] = [];
  orthographies.forEach((orthography) => {
    const language = languages[orthography.languageCode];
    const writingSystem = writingSystems[orthography.scriptCode];

    if (language != null) {
      orthography.language = language;
      if (!language.orthographies) language.orthographies = [];
      language.orthographies.push(orthography);
      if (
        !language.writingSystems[orthography.scriptCode] &&
        !!language.primaryWritingSystem &&
        language.primaryWritingSystem?.ID !== orthography.scriptCode
      ) {
        // iku_Latn_CA	Inuktitut (Latin) (Canada, Latin)	Inuktitut	CLDR	42,674	official_regional
        missingLocales.push(
          [
            `${language.ID}_${orthography.scriptCode}_${language.locales[0]?.territoryCode}`,
            `${language.nameDisplay} (${writingSystem.nameDisplay ?? orthography.scriptCode}, ${language.locales[0]?.territory?.nameDisplay})`,
            '\t\t\t', // No census or official support data available
          ].join('\t'),
        );
        language.writingSystems[orthography.scriptCode] = writingSystem;
      }
    }

    if (writingSystem != null) {
      orthography.writingSystem = writingSystem;
      if (!writingSystem.characters) writingSystem.characters = new Set();
      orthography.baseCharacters?.split('').forEach((char) => writingSystem.characters!.add(char));
    }

    // Update the name (we should do this in the compute step instead...)
    orthography.nameDisplay =
      (language?.nameDisplay ?? orthography.codeDisplay) +
      ' (' +
      (writingSystem?.nameDisplay ?? orthography.codeDisplay) +
      ')';
    orthography.names.push(orthography.nameDisplay);
  });

  console.table('Please add these locales', missingLocales.join('\n'));
}
