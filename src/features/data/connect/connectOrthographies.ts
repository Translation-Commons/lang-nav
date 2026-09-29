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
    if (language != null) {
      orthography.language = language;
      if (!language.orthographies) language.orthographies = [];
      language.orthographies.push(orthography);
    }

    const writingSystem = writingSystems[orthography.scriptCode];
    if (writingSystem != null) orthography.writingSystem = writingSystem;

    // Update the name (we should do this in the compute step instead...)
    orthography.nameDisplay =
      (language?.nameDisplay ?? orthography.codeDisplay) +
      ' (' +
      (writingSystem?.nameDisplay ?? orthography.codeDisplay) +
      ')';
    orthography.names.push(orthography.nameDisplay);
  });
}
