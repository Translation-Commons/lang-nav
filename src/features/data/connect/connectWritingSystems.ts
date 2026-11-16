import { LanguageDictionary } from '@entities/language/LanguageTypes';
import { TerritoryCode, TerritoryData } from '@entities/territory/TerritoryTypes';
import { ScriptCode, WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export function connectWritingSystems(
  languages: LanguageDictionary,
  territoriesByCode: Record<TerritoryCode, TerritoryData>,
  writingSystems: Record<ScriptCode, WritingSystemData>,
): void {
  // Connect the writing systems their origin language and territory
  Object.values(writingSystems).forEach((writingSystem) => {
    const {
      primaryLanguageCode,
      territoryOfOriginCode,
      parentWritingSystemCode,
      containsWritingSystemsCodes,
    } = writingSystem;
    const language = primaryLanguageCode != null ? languages[primaryLanguageCode] : null;
    const territory =
      territoryOfOriginCode != null ? territoriesByCode[territoryOfOriginCode] : null;
    const parentWritingSystem =
      parentWritingSystemCode != null ? writingSystems[parentWritingSystemCode] : null;

    if (language != null) {
      writingSystem.primaryLanguage = language;
      if (!writingSystem.languages) writingSystem.languages = {};
      writingSystem.languages[language.ID] = language;
      language.writingSystems[writingSystem.ID] = writingSystem;
    }
    if (territory != null) {
      writingSystem.territoryOfOrigin = territory;
    }
    if (parentWritingSystem != null) {
      writingSystem.parentWritingSystem = parentWritingSystem;
      if (!parentWritingSystem.childWritingSystems) parentWritingSystem.childWritingSystems = [];
      parentWritingSystem.childWritingSystems.push(writingSystem);
    }
    if (containsWritingSystemsCodes && containsWritingSystemsCodes.length > 0) {
      writingSystem.containsWritingSystems = containsWritingSystemsCodes
        .map((code) => {
          // Also add reverse edge
          const containedSystem = writingSystems[code];
          if (containedSystem.groupedByWritingSystems == null)
            containedSystem.groupedByWritingSystems = [];
          if (!containedSystem.groupedByWritingSystems.find((ws) => ws.ID === writingSystem.ID))
            containedSystem.groupedByWritingSystems.push(writingSystem);

          // Return the contained system for the forward edge
          return containedSystem;
        })
        .filter(Boolean);
    }
  });

  // Connect languages to their primary writing system
  Object.entries(languages).forEach(([languageCode, language]) => {
    if (languageCode !== language.ID) return; // Skip aliases

    const { primaryScriptCode } = language;
    if (primaryScriptCode != null) {
      const primaryWritingSystem = writingSystems[primaryScriptCode];
      if (primaryWritingSystem != null) {
        if (!primaryWritingSystem.languages) primaryWritingSystem.languages = {};
        primaryWritingSystem.languages[language.ID] = language;
        language.primaryWritingSystem = primaryWritingSystem;
        language.writingSystems[primaryWritingSystem.ID] = primaryWritingSystem;
      }
    }
  });
}
