import { ObjectType } from '@features/params/PageParamTypes';

import { KeyboardData, KeyboardDictionary, KeyboardPlatform } from '@entities/keyboard/KeyboardTypes';

import { loadObjectsFromFile } from './loadObjectsFromFile';

export async function loadKeyboardsGBoard(): Promise<KeyboardDictionary | void> {
    return await loadObjectsFromFile<KeyboardData>(
        'data/google/gboards.tsv',
        parseKeyboardGBoardLine,
    );
}


export function parseKeyboardGBoardLine(line: string): KeyboardData | undefined {
    if (line.startsWith('#') || line.startsWith('ID') || line.trim() === '') return undefined;

    const parts = line.split('\t');
    console.log('parts:', parts);
    const id = parts[0];
    const nameDisplay = parts[1];
    const languageCode = parts[2];
    const territoryCode = parts[3] !== '' ? parts[3] : undefined;
    const inputScriptCode = parts[4];
    const outputScriptCode = parts[5];
    const variantTagCode = parts[6] !== '' ? parts[6] : undefined;

    return {
        type: ObjectType.Keyboard,
        ID: id,
        codeDisplay: id,
        nameDisplay,
        names: [nameDisplay],
        platform: KeyboardPlatform.GBoard,
        languageCode,
        territoryCode,
        inputScriptCode,
        outputScriptCode,
        variantTagCode,
    };
}