import { LanguageDictionary } from '@entities/language/LanguageTypes';
import { Orthography } from '@entities/orthography/OrthographyTypes';
import { ScriptCode, WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export function connectOrthographies(
    languages: LanguageDictionary,
    writingSystems: Record<ScriptCode, WritingSystemData>,
    orthographies: Orthography[],
): void {
    orthographies.forEach((orthography) => {
        const language = languages[orthography.languageCode];
        const writingSystem = Object.values(writingSystems).find(
            (ws) => ws.nameDisplay === orthography.scriptName || ws.nameFull === orthography.scriptName,
        );

        if (writingSystem != null) {
            orthography.writingSystem = writingSystem;
        }
        if (language != null) {
            orthography.language = language;
            if (!language.orthographies) language.orthographies = [];
            language.orthographies.push(orthography);
        }
    });
}

