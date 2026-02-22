import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { LanguageDictionary } from '@entities/language/LanguageTypes';
import { TerritoryCode, TerritoryData } from '@entities/territory/TerritoryTypes';
import { ScriptCode, WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export function connectKeyboards(
    keyboards: Record<string, KeyboardData>,
    languages: LanguageDictionary,
    territoriesByCode: Record<TerritoryCode, TerritoryData>,
    writingSystems: Record<ScriptCode, WritingSystemData>,
): void {
    Object.values(keyboards).forEach((keyboard) => {
        const { languageCode, territoryCode, inputScriptCode, outputScriptCode } = keyboard;

        const language = languages[languageCode] ?? null;
        const territory = territoryCode != null ? territoriesByCode[territoryCode] ?? null : null;
        const inputWritingSystem = writingSystems[inputScriptCode] ?? null;
        const outputWritingSystem = writingSystems[outputScriptCode] ?? null;

        if (language != null) keyboard.language = language;
        if (territory != null) keyboard.territory = territory;
        if (inputWritingSystem != null) keyboard.inputWritingSystem = inputWritingSystem;
        if (outputWritingSystem != null) keyboard.outputWritingSystem = outputWritingSystem;
    });
}