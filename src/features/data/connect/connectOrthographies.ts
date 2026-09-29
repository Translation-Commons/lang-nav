import { LanguageDictionary } from '@entities/language/LanguageTypes';
import { OrthographyData } from '@entities/orthography/OrthographyTypes';
import { ScriptCode, WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export function connectOrthographies(
  languages: LanguageDictionary,
  writingSystems: Record<ScriptCode, WritingSystemData>,
  orthographies: OrthographyData[],
): void {
  orthographies.forEach((orthography) => {
    const language = languages[orthography.languageCode];

    const writingSystem = writingSystems[orthography.scriptCode];
    const writingSystem2 = Object.values(writingSystems).find(
      (ws) => ws.nameDisplay === orthography.scriptCode || ws.nameFull === orthography.scriptCode,
    );

    if (writingSystem != null) {
      orthography.writingSystem = writingSystem;
    } else {
      console.warn(
        `Writing system not found for script code: ${orthography.scriptCode}`,
        writingSystem2?.ID,
      );
    }
    if (language != null) {
      orthography.language = language;
      if (!language.orthographies) language.orthographies = [];
      language.orthographies.push(orthography);
    }
  });
}
