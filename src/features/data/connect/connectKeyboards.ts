import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { LanguageDictionary } from '@entities/language/LanguageTypes';
import { LocaleData, StandardLocaleCode } from '@entities/locale/LocaleTypes';
import { TerritoryCode, TerritoryData } from '@entities/territory/TerritoryTypes';
import { VariantData } from '@entities/variant/VariantTypes';
import { ScriptCode, WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { getLessSpecificLocaleTags } from '../compute/searchLocalesForMissingLinks';

export function connectKeyboards(
  keyboards: Record<string, KeyboardData>,
  languages: LanguageDictionary,
  territoriesByCode: Record<TerritoryCode, TerritoryData>,
  writingSystems: Record<ScriptCode, WritingSystemData>,
  variants: Record<string, VariantData>,
  locales: Record<StandardLocaleCode, LocaleData>,
): void {
  Object.values(keyboards).forEach((keyboard) => {
    const { languageCode, territoryCode, inputScriptCode, outputScriptCode, variantCode } =
      keyboard;

    const language = languages[languageCode] ?? null;
    const territory = territoryCode != null ? (territoriesByCode[territoryCode] ?? null) : null;
    const inputWritingSystem = writingSystems[inputScriptCode] ?? null;
    const outputWritingSystem = writingSystems[outputScriptCode] ?? null;
    const variant = variantCode != null ? (variants[variantCode] ?? null) : null;
    const localeTags = {
      languageCode,
      scriptCode: outputScriptCode,
      territoryCode,
      variantCodes: variantCode ? [variantCode] : [],
    };

    const localeTagsToTry = getLessSpecificLocaleTags(localeTags);
    const locale =
      localeTagsToTry
        .reverse() // most specific first
        .map((tag: string) => locales[tag])
        .find((l: LocaleData | undefined) => l != null) ?? null;

    if (language != null) {
      keyboard.language = language;
      if (!language.keyboards) language.keyboards = [];
      language.keyboards.push(keyboard);
    }
    if (territory != null) keyboard.territory = territory;
    if (inputWritingSystem != null) keyboard.inputWritingSystem = inputWritingSystem;
    if (outputWritingSystem != null) {
      keyboard.outputWritingSystem = outputWritingSystem;
      if (!outputWritingSystem.outputKeyboards) outputWritingSystem.outputKeyboards = [];
      outputWritingSystem.outputKeyboards.push(keyboard);
    }
    if (variant != null) keyboard.variant = variant;
    if (locale != null) keyboard.locale = locale;
  });
}
