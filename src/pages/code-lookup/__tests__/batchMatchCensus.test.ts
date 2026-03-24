import { renderHook, waitFor } from '@testing-library/react';
import * as fs from 'fs';
import * as path from 'path';
import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import * as DataProviderModule from '@features/data/context/DataProvider';
const DataProvider = (DataProviderModule as any).DataProvider || (DataProviderModule as any).default;

import * as UseDataContextModule from '@features/data/context/useDataContext';
const useDataContext = (UseDataContextModule as any).useDataContext || (UseDataContextModule as any).default;

import * as PageParamsModule from '@features/params/PageParamsProvider';
const PageParamsProvider = (PageParamsModule as any).PageParamsProvider || (PageParamsModule as any).default;

import { LanguageData } from '@entities/language/LanguageTypes';
import { findBestMatch } from '../batchMatchLogic';


const PUBLIC_DIR = path.resolve(__dirname, '../../../../public');
const CENSUS_DIR = path.join(PUBLIC_DIR, 'data/census/official');


function parseCensusTSV(filePath: string): Array<{ expectedCode: string; name: string }> {
    const text = fs.readFileSync(filePath, 'utf-8');
    const lines = text.split('\n');
    const results: Array<{ expectedCode: string; name: string }> = [];

    let pastHeader = false;

    for (const line of lines) {
        if (line.startsWith('#')) continue;

        if (!pastHeader) {
            pastHeader = true;
            continue;
        }

        const parts = line.split('\t');
        const code = parts[0]?.trim();
        const name = parts[1]?.trim();

        if (!code || !name) continue;
        if (name.startsWith('#')) continue;
        if (code === 'und' || code === 'mul' || code === 'zxx') continue;
        if (name.includes('Sign')) continue;

        results.push({ expectedCode: code, name });
    }

    return results;
}


function topByFrequency<T>(
    items: T[],
    keyFn: (item: T) => string,
    topN: number,
): Array<{ key: string; count: number; representative: T }> {
    const groups = new Map<string, { count: number; representative: T }>();

    for (const item of items) {
        const key = keyFn(item);
        const existing = groups.get(key);
        if (existing) {
            existing.count++;
        } else {
            groups.set(key, { count: 1, representative: item });
        }
    }

    return [...groups.entries()]
        .map(([key, { count, representative }]) => ({ key, count, representative }))
        .sort((a, b) => b.count - a.count)
        .slice(0, topN);
}


// extract the loaded LanguageData array
function findLanguages(obj: any, visited = new Set()): any[] {
    if (!obj || typeof obj !== 'object' || visited.has(obj)) return [];
    visited.add(obj);

    // check if Array of LanguageData
    if (Array.isArray(obj) && obj.length > 1000 && obj[0] && 'ID' in obj[0] && 'names' in obj[0]) {
        return obj;
    }
    // check if Map of LanguageData
    if (obj instanceof Map && obj.size > 1000) {
        const arr = Array.from(obj.values());
        if (arr[0] && 'ID' in arr[0] && 'names' in arr[0]) return arr;
    }
    // recurse down
    for (const key of Object.keys(obj)) {
        const res = findLanguages(obj[key], visited);
        if (res.length > 0) return res;
    }
    return [];
}


describe('Batch Match Census Accuracy Test', () => {
    let languageArray: LanguageData[] = [];
    const originalFetch = global.fetch;

    beforeAll(async () => {
        // 1. mock global fetch to read from filesystem
        global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
            let urlStr = '';
            if (typeof input === 'string') urlStr = input;
            else if (input instanceof URL) urlStr = input.toString();
            else if (typeof input === 'object' && 'url' in input) urlStr = (input as Request).url;
            else urlStr = String(input);

            const match = urlStr.match(/data\/.*$/); // capture 'data/languages.tsv'

            if (match) {
                const filePath = path.join(PUBLIC_DIR, match[0]);

                if (fs.existsSync(filePath)) {
                    const text = fs.readFileSync(filePath, 'utf-8');
                    const isJson = filePath.endsWith('.json');
                    return new Response(text, {
                        status: 200,
                        headers: { 'Content-Type': isJson ? 'application/json' : 'text/tab-separated-values' }
                    });
                } else {
                    console.warn(`[Fetch Mock] Missing file: ${filePath}`);
                    return new Response('Not found', { status: 404 });
                }
            }

            if (urlStr.startsWith('http') && originalFetch) {
                return originalFetch(input, init);
            }
            return new Response('Not found', { status: 404 });
        };

        // 2. render data inside headless component wrapper
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(MemoryRouter, null,
                React.createElement(PageParamsProvider, null,
                    React.createElement(DataProvider, null, children)
                )
            );

        const { result } = renderHook(() => useDataContext(), { wrapper });

        // 3. wait to fetch and link the data
        await waitFor(
            () => {
                const current = result.current;
                const values = findLanguages(current);

                expect(values.length).toBeGreaterThan(1000);
                languageArray = values;
            },
            { timeout: 30000, interval: 1000 }
        );
    }, 45000);

    afterAll(() => {
        global.fetch = originalFetch;
    });

    it('should load local language data successfully', () => {
        expect(languageArray.length).toBeGreaterThan(1000);
    });

    it('should evaluate census language names against findBestMatch logic', { timeout: 60000 }, () => {
        let totalEntries = 0;
        let exactMatches = 0;
        let baseCodeMatches = 0;
        let noMatches = 0;
        const mismatches: Array<{ file: string; name: string; expected: string; got: string }> = [];
        const baseMatches: Array<{ file: string; name: string; expected: string; got: string }> = [];

        const censusFiles = fs.readdirSync(CENSUS_DIR).filter((f) => f.endsWith('.tsv'));

        for (const file of censusFiles) {
            const filePath = path.join(CENSUS_DIR, file);
            const entries = parseCensusTSV(filePath);

            for (const { expectedCode, name } of entries) {
                totalEntries++;
                const result = findBestMatch(name, languageArray);

                if (result.code === expectedCode) {
                    exactMatches++;
                } else if (result.code === '???') {
                    noMatches++;
                    mismatches.push({ file, name, expected: expectedCode, got: '???' });
                } else {
                    const expectedBase = expectedCode.includes('/')
                        ? expectedCode.split('/').pop()!
                        : expectedCode;
                    const gotBase = result.code.includes('/') ? result.code.split('/').pop()! : result.code;

                    if (gotBase === expectedBase) {
                        baseCodeMatches++;
                        baseMatches.push({ file, name, expected: expectedCode, got: result.code });
                    } else {
                        mismatches.push({ file, name, expected: expectedCode, got: result.code });
                    }
                }
            }
        }

        const wrongCount = totalEntries - exactMatches - baseCodeMatches - noMatches;
        const fullMatchRate = ((exactMatches / totalEntries) * 100).toFixed(1);
        const baseMatchRate = (((exactMatches + baseCodeMatches) / totalEntries) * 100).toFixed(1);
        const noMatchRate = ((noMatches / totalEntries) * 100).toFixed(1);
        const mismatchRate = ((wrongCount / totalEntries) * 100).toFixed(1);

        const summaryRow = (label: string, count: number | string, note: string) =>
            `  ${label.padEnd(26)}${String(count).padStart(7)}   ${note}`;

        console.log('\n===========================================================');
        console.log('           BATCH MATCH CENSUS ACCURACY REPORT');
        console.log('===========================================================');
        console.log(summaryRow('Census files tested:', censusFiles.length, ''));
        console.log(summaryRow('Total entries:', totalEntries, ''));
        console.log('-----------------------------------------------------------');
        console.log(summaryRow('Exact matches:', exactMatches, `(${fullMatchRate}%)`));
        console.log(summaryRow('Base code matches:', baseCodeMatches, '(macro prefix differs)'));
        console.log(summaryRow('No match (???):', noMatches, `(${noMatchRate}%)`));
        console.log(summaryRow('Wrong match:', wrongCount, `(${mismatchRate}%)`));
        console.log('-----------------------------------------------------------');
        console.log(summaryRow('Overall accuracy:', `${baseMatchRate}%`, '(exact + base code)'));
        console.log('===========================================================');

        const NAME_WIDTH = 28;
        const CODE_WIDTH = 20;
        const listRow = (count: number, name: string, expected: string, got?: string) => {
            const namePart = `"${name}"`.padEnd(NAME_WIDTH);
            const expectedPart = `expected: ${expected}`.padEnd(CODE_WIDTH);
            return got !== undefined
                ? `  x${String(count).padStart(3)}  ${namePart}  ${expectedPart}  got: ${got}`
                : `  x${String(count).padStart(3)}  ${namePart}  expected: ${expected}`;
        };

        const wrongMismatches = mismatches.filter((m) => m.got !== '???');
        if (wrongMismatches.length > 0) {
            const top10Wrong = topByFrequency(
                wrongMismatches,
                (m) => `${m.name}|${m.expected}|${m.got}`,
                10,
            );
            console.log('\n  TOP 10 WRONG MATCHES:');
            console.log('  ---------------------------------------------------------');
            top10Wrong.forEach(({ count, representative: { name, expected, got } }) => {
                console.log(listRow(count, name, expected, got));
            });
        }

        const noMatchEntries = mismatches.filter((m) => m.got === '???');
        if (noMatchEntries.length > 0) {
            const top10NoMatch = topByFrequency(noMatchEntries, (m) => `${m.name}|${m.expected}`, 10);
            console.log('\n  TOP 10 NO MATCHES (???):');
            console.log('  ---------------------------------------------------------');
            top10NoMatch.forEach(({ count, representative: { name, expected } }) => {
                console.log(listRow(count, name, expected));
            });
        }

        if (baseMatches.length > 0) {
            const top10Base = topByFrequency(
                baseMatches,
                (m) => `${m.name}|${m.expected}|${m.got}`,
                10,
            );
            console.log('\n  TOP 10 PREFIX MISMATCHES (only base code correct):');
            console.log('  ---------------------------------------------------------');
            top10Base.forEach(({ count, representative: { name, expected, got } }) => {
                console.log(listRow(count, name, expected, got));
            });
        }

        console.log('\n');

        expect(exactMatches + baseCodeMatches).toBeGreaterThan(0);
    });
});