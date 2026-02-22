/**
 * Enums and types related to keyboards
 */
import { ObjectType } from '@features/params/PageParamTypes';

import { LanguageCode, LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryCode, TerritoryData } from '@entities/territory/TerritoryTypes';
import { ScriptCode, WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { ObjectBase } from '@entities/types/DataTypes';

export enum KeyboardPlatform {
    GBoard = 'GBoard',
    Keyman = 'Keyman'
}

export type KeyboardDictionary = Record<string, KeyboardData>;

export interface KeyboardData extends ObjectBase {
    type: ObjectType.Keyboard;

    // From TSV
    ID: string;                     // eg. gboard_ahr_Deva_t_k0_Latn
    codeDisplay: string;
    nameDisplay: string;            // eg. "Ahirani, Transliteration"
    names: string[];
    platform: KeyboardPlatform;
    languageCode: LanguageCode;
    territoryCode?: TerritoryCode;
    inputScriptCode: ScriptCode;
    outputScriptCode: ScriptCode;
    variantTagCode?: string;

    // Computed after loading
    language?: LanguageData;
    territory?: TerritoryData;
    inputWritingSystem?: WritingSystemData;
    outputWritingSystem?: WritingSystemData;
}