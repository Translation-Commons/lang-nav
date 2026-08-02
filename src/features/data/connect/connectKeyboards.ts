import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { getLanguageRootMacrolanguage } from '@entities/language/LanguageFamilyUtils';
import { LanguageData, LanguageDictionary } from '@entities/language/LanguageTypes';
import { LocaleData, StandardLocaleCode } from '@entities/locale/LocaleTypes';
import { TerritoryCode, TerritoryData } from '@entities/territory/TerritoryTypes';
import { VariantData } from '@entities/variant/VariantTypes';
import { ScriptCode, WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { getLessSpecificLocaleTags } from '../compute/searchLocalesForMissingLinks';

export function connectKeyboards(
  keyboards: Record<string, KeyboardData>,
  languages: LanguageDictionary,
  languagesCLDR: LanguageDictionary,
  territoriesByCode: Record<TerritoryCode, TerritoryData>,
  writingSystems: Record<ScriptCode, WritingSystemData>,
  variants: Record<string, VariantData>,
  locales: Record<StandardLocaleCode, LocaleData>,
): void {
  Object.values(keyboards).forEach((keyboard) => {
    const { languageCodes, territoryCode, inputScriptCode, outputScriptCode, variantCode } =
      keyboard;

    // Connect territory, writing systems, variant tag (same for all platforms)
    const territory = territoryCode != null ? (territoriesByCode[territoryCode] ?? null) : null;
    const inputWritingSystem = writingSystems[inputScriptCode] ?? null;
    const outputWritingSystem = writingSystems[outputScriptCode] ?? null;
    const variant = variantCode != null ? (variants[variantCode] ?? null) : null;
    if (territory != null) keyboard.territory = territory;
    if (inputWritingSystem != null) keyboard.inputWritingSystem = inputWritingSystem;
    if (outputWritingSystem != null) {
      keyboard.outputWritingSystem = outputWritingSystem;
      if (!outputWritingSystem.outputKeyboards) outputWritingSystem.outputKeyboards = [];
      outputWritingSystem.outputKeyboards.push(keyboard);
    }
    if (variant != null) keyboard.variant = variant;

    // Connect languages (GBoard: 1 language, Keyman: 1 or more)
    for (const langCode of languageCodes) {
      const language = languages[langCode] ?? languagesCLDR[langCode] ?? null;
      if (language == null) continue;
      addKeyboardToLanguage(keyboard, language);

      // Associate a language's macrolanguage (for now, not always a safe bet)
      const macrolanguage = getLanguageRootMacrolanguage(language);
      if (macrolanguage != null && macrolanguage.ID !== language.ID)
        addKeyboardToLanguage(keyboard, macrolanguage);
    }

    // Locale resolution — one locale per language code
    keyboard.locales = [];
    for (const langCodeBase of languageCodes) {
      const langCode = languages[langCodeBase]?.ID ?? languagesCLDR[langCodeBase]?.ID ?? null;
      const localeTags = {
        languageCode: langCode,
        scriptCode: outputScriptCode,
        territoryCode,
        variantCodes: variantCode ? [variantCode] : [],
      };
      const localeTagsToTry = getLessSpecificLocaleTags(localeTags);
      const locale =
        localeTagsToTry
          .reverse()
          .map((tag: string) => locales[tag])
          .find((l: LocaleData | undefined) => l != null) ?? null;
      if (locale != null) keyboard.locales.push(locale);
    }
  });
}

function addKeyboardToLanguage(keyboard: KeyboardData, language: LanguageData) {
  if (!keyboard.languages) keyboard.languages = [];
  if (keyboard.languages.includes(language)) return; // already associated
  keyboard.languages.push(language);
  if (!language.keyboards) language.keyboards = [];
  language.keyboards.push(keyboard);
}
