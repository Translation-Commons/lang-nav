/**
 * 1. reuse anyWordStartsWith from SearchBar to find mcandidate matches
 * 2. score candidates by exact match > code match > scope > short code
 * 3. if best match has macrolanguage parent > produce composite code (e.g. `lah/pan`)
*/

// Urdu
// Punjabi
// Hindko
// Mewati

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { anyWordStartsWith, normalizeAccents } from '@shared/lib/stringUtils';


export type BatchMatchResult = {
    code: string;
    languageName: string;
    warning?: string;
};



export function findBestMatch(query: string, languages: LanguageData[]): BatchMatchResult {
    const trimmed = query.trim();

    if (trimmed === '') {
        return { code: '', languageName: '' };
    }

    const normalizedQuery = normalizeAccents(trimmed.toLowerCase());

    // 1. re-use anyWordStartsWith from SearchBar to find mcandidate matches
    const matches = languages.filter((lang) =>
        lang.names.some((name) => anyWordStartsWith(name, trimmed)),
    );

    if (matches.length === 0) {
        return { code: '???', languageName: '', warning: `No match found for "${trimmed}"` };
    }

    // 2. score candidates by exact match > code match > scope > short code
    const scored = matches.map((lang) => ({
        lang,
        score: scoreLang(lang, normalizedQuery),
    }));
    scored.sort((a, b) => b.score - a.score);

    // 3. if best match has macrolanguage parent > produce composite code (e.g. `lah/pan`)
    const best = scored[0].lang;
    const code = buildCompositeCode(best);

    const warning =
        scored.length > 1 && scored[0].score === scored[1].score
            ? `Multiple matches for "${trimmed}" (showing best)`
            : undefined;

    return { code, languageName: best.nameDisplay, warning };
}


// TODO: 


export function batchLookup(queries: string[], languages: LanguageData[]): BatchMatchResult[] {
    return queries.map((query) => findBestMatch(query, languages));
}


// TODO: try hamming/edit distance, maybe fuse.js ???
function scoreLang(lang: LanguageData, normalizedQuery: string): number {
    let score = 0;

    // exact name match
    const hasExactName = lang.names.some(
        (name) => normalizeAccents(name.toLowerCase()) === normalizedQuery,
    );
    if (hasExactName) score += 100;

    // // exact code match (e.g. `urd`) (???)
    // if (lang.ID.toLowerCase() === normalizedQuery || lang.codeDisplay.toLowerCase() === normalizedQuery) {
    //   score += 50;
    // }

    // prefer macrolanguage exact matches (`pus` >> `pus/pbu`)
    if (hasExactName && isMacrolanguage(lang)) score += 20;

    // prefer individual languages over dialects(?)
    // (but less than macrolanguages that already got +20 above)
    if (lang.scope === LanguageScope.Language) score += 10;

    // prefer iso codes (3-letter) over glottocodes (8 chars)
    if (lang.ID.length <= 3) score += 5;

    return score;
}


function buildCompositeCode(lang: LanguageData): string {
    const macroAncestor = findMacrolanguageAncestor(lang);
    if (macroAncestor) {
        return macroAncestor.ID + '/' + lang.ID;
    }
    return lang.ID;
}


function isMacrolanguage(lang: LanguageData): boolean {
    return lang.scope === LanguageScope.Macrolanguage
        || lang.ISO?.scope === LanguageScope.Macrolanguage;
}


function findMacrolanguageAncestor(lang: LanguageData): LanguageData | undefined {
    let current = lang.parentLanguage;
    let depth = 0;
    while (current && depth < 10) {
        if (isMacrolanguage(current)) {
            return current;
        }
        current = current.parentLanguage;
        depth++;
    }
    return undefined;
}
