import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { LanguageDictionary } from '@entities/language/LanguageTypes';
import { TerritoryCode, TerritoryData } from '@entities/territory/TerritoryTypes';
import { VariantTagData } from '@entities/varianttag/VariantTagTypes';
import { ScriptCode, WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export function connectKeyboards(
  keyboards: Record<string, KeyboardData>,
  languages: LanguageDictionary,
  territoriesByCode: Record<TerritoryCode, TerritoryData>,
  writingSystems: Record<ScriptCode, WritingSystemData>,
  variantTags: Record<string, VariantTagData>,
): void {
  Object.values(keyboards).forEach((keyboard) => {
    const { languageCode, territoryCode, inputScriptCode, outputScriptCode, variantTagCode } =
      keyboard;

    const language = languages[languageCode] ?? null;
    const territory = territoryCode != null ? (territoriesByCode[territoryCode] ?? null) : null;
    const inputWritingSystem = writingSystems[inputScriptCode] ?? null;
    const outputWritingSystem = writingSystems[outputScriptCode] ?? null;
    const variantTag = variantTagCode != null ? (variantTags[variantTagCode] ?? null) : null;

    if (language != null) keyboard.language = language;
    if (territory != null) keyboard.territory = territory;
    if (inputWritingSystem != null) keyboard.inputWritingSystem = inputWritingSystem;
    if (outputWritingSystem != null) keyboard.outputWritingSystem = outputWritingSystem;
    if (variantTag != null) keyboard.variantTag = variantTag;
  });
}
