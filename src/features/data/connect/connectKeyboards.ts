import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { LanguageDictionary } from '@entities/language/LanguageTypes';
import { LocaleData, StandardLocaleCode } from '@entities/locale/LocaleTypes';
import { TerritoryCode, TerritoryData } from '@entities/territory/TerritoryTypes';
import { VariantTagData } from '@entities/varianttag/VariantTagTypes';
import { ScriptCode, WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export function connectKeyboards(
  keyboards: Record<string, KeyboardData>,
  languages: LanguageDictionary,
  territoriesByCode: Record<TerritoryCode, TerritoryData>,
  writingSystems: Record<ScriptCode, WritingSystemData>,
  variantTags: Record<string, VariantTagData>,
  locales: Record<StandardLocaleCode, LocaleData>,
): void {
  Object.values(keyboards).forEach((keyboard) => {
    const { languageCode, territoryCode, inputScriptCode, outputScriptCode, variantTagCode } =
      keyboard;

    const language = languages[languageCode] ?? null;
    const territory = territoryCode != null ? (territoriesByCode[territoryCode] ?? null) : null;
    const inputWritingSystem = writingSystems[inputScriptCode] ?? null;
    const outputWritingSystem = writingSystems[outputScriptCode] ?? null;
    const variantTag = variantTagCode != null ? (variantTags[variantTagCode] ?? null) : null;
    const localeKeysToTry: StandardLocaleCode[] = [
      [languageCode, outputScriptCode, territoryCode, variantTagCode],
      [languageCode, outputScriptCode, territoryCode],
      [languageCode, territoryCode],
      [languageCode, outputScriptCode],
      [languageCode],
    ].map((parts) => parts.filter(Boolean).join('_'));

    const locale = localeKeysToTry.map((key) => locales[key]).find((l) => l != null) ?? null;

    if (language != null) keyboard.language = language;
    if (territory != null) keyboard.territory = territory;
    if (inputWritingSystem != null) keyboard.inputWritingSystem = inputWritingSystem;
    if (outputWritingSystem != null) keyboard.outputWritingSystem = outputWritingSystem;
    if (variantTag != null) keyboard.variantTag = variantTag;
    if (locale != null) keyboard.locale = locale;
  });
}
