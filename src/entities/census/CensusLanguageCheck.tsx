import React, { ReactNode, useCallback } from 'react';

import { getObjectParents } from '@widgets/pathnav/getParentsAndDescendants';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { SearchableField } from '@features/params/PageParamTypes';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';
import getSubstringFilterOnQuery from '@features/transforms/search/getSubstringFilterOnQuery';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { EntityData } from '@entities/types/DataTypes';

import CommaSeparated from '@shared/ui/old/CommaSeparated';

import CensusLanguageCheckRow from './CensusLanguageCheckRow';
import { isIgnoredLanguageCode, parseCensusLanguageName } from './parseCensusLanguageRow';
import { parseCensusMetadata } from './parseCensusMetadata';

// These language codes won't raise errors because the issues are known to be misleading
const OKAY_STATUS = ['aus'];
const OKAY_MACRO = ['mlt', 'mar', 'tgk'];
const OVERRIDE_LANGUAGE_MATCH: Record<string, string> = {
  hokkien: 'taib1242',
  teochew: 'chao1238',
  malay: 'zlm',
  other: 'mul',
};

export type CensusLanguageNotes = {
  lineNumber: number;
  codePath: string; // allowing for /-separated codes
  codePathRec?: string;
  specificCode?: string; // the most specific code (eg. `srp` in `hbs/srp`) which will be used for the language name
  originalName: string;
  name?: string;
  entry?: LanguageData;
  issues: ReactNode[];
};

const CensusLanguageCheck: React.FC<{ fileInput: string }> = ({ fileInput }) => {
  const lines = fileInput.split('\n');
  const { endOfMetadataLine, singleColumnMode } = parseCensusMetadata(lines, 'census');
  const { getLanguage, languagesInSelectedSource } = useDataContext();
  const { filteredEntities: languageEnts } = useFilteredEntities({
    inputEntities: languagesInSelectedSource,
  });
  const findLanguage = useCallback(
    (searchString: string) => {
      const searchLower = searchString.toLowerCase();
      if (OVERRIDE_LANGUAGE_MATCH[searchLower]) {
        const overrideCode = OVERRIDE_LANGUAGE_MATCH[searchLower];
        const overrideLang = languageEnts.find((l) => l.ID === overrideCode);
        return overrideLang;
      }
      const ents = languageEnts.filter(
        getSubstringFilterOnQuery(searchString, SearchableField.NameAny),
      );
      const exactMatch = ents.find((e) => e.nameDisplay.toLowerCase() === searchLower);
      if (exactMatch) return exactMatch;
      const matchInList = ents.find((e) => e.names.some((n) => n.toLowerCase() === searchLower));
      if (matchInList) return matchInList;
      return ents[0];
    },
    [languageEnts],
  );

  // If a use only passes a single column, we'll expect that to be a single column of language names
  // const singleColumnMode;

  const languages = lines.splice(endOfMetadataLine).map((line, i) => {
    if (line.trim() === '') return null; // Skip empty lines
    const parts = line.split('\t');
    if (!singleColumnMode && parts.length < 2) return null; // Skip lines that do not have enough data

    // Most rows specify a single language code (eg. `eng`), but some specify multiple codes separated by a slash (eg. `hbs/srp`)
    let codes: string[] = [];
    if (!singleColumnMode) {
      codes = parts[0]
        // split if it is not contained in parentheses
        .split(/\/(?![^(]*\))/)
        .map((code) => code.trim())
        .filter(Boolean);
    }
    // The most specific code is the last one (eg. `srp` in `hbs/srp`)
    const specificCode = codes.length > 0 ? codes[codes.length - 1] : undefined;
    const originalName = singleColumnMode ? parts[0].trim() : parts[1].trim();

    return {
      lineNumber: i + endOfMetadataLine + 1,
      codePath: !singleColumnMode ? parts[0] : '',
      specificCode,
      originalName,
      name: parseCensusLanguageName(originalName),
      entry: specificCode ? getLanguage(specificCode) : undefined,
      issues: [],
    } as CensusLanguageNotes;
  }) as (CensusLanguageNotes | undefined)[];

  languages.forEach((l) => {
    if (l == null) return;
    if (!l.name && !l.specificCode) {
      l.issues.push('Language name and code are missing but there appears to be data in the row.');
      return;
    }
    if (l.name && !l.name.startsWith('#')) {
      if (!l.specificCode) {
        l.issues.push(
          'Language code is missing, but there is a language name -- check if the language code can be identified and added to the data.',
        );
      }
    }

    // Commented out codes and ones for special codes are there for documentation but are ignored in the import.
    if (l.specificCode && isIgnoredLanguageCode(l.specificCode)) return;
    const foundLanguage = l.name ? findLanguage(l.name) : undefined;

    checkName(l);
    checkStatusInName(l);
    checkFoundLanguage(l, foundLanguage);
    checkMacrolanguage(l, foundLanguage);
  });

  const copyLanguageCodes = useCallback(() => {
    const codesToCopy = languages.map((l) => (l ? (l.codePathRec ?? l.codePath) : '')).join('\n');
    navigator.clipboard.writeText(codesToCopy);
  }, [languages]);

  if (!languages.some((l) => l && l.issues.length > 0)) {
    return <div>No issues found with language codes or names.</div>;
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Line</th>
            <th>Recommended Code(s)</th>
            <th>Original Language Code(s)</th>
            <th>Language Name in Census</th>
            <th>Issues</th>
          </tr>
        </thead>
        <tbody>
          {languages.map(
            (l, i) => l && l.issues.length > 0 && <CensusLanguageCheckRow key={i} notes={l} />,
          )}
        </tbody>
      </table>
      <button onClick={copyLanguageCodes}>Copy language codes after optimistic correction</button>
    </>
  );
};

function checkName(l: CensusLanguageNotes) {
  if (l.originalName?.startsWith('#')) return; // Ignore names that are commented out

  if (!l.name) {
    l.issues.push(
      'The name is missing, please list the name from the census, prefixed by a # if it is not a proper name.',
    );
    return;
  }

  if (!l.entry) return; // No entries to compare against
  if (l.name === l.entry.nameDisplay) return; // If the name matches the main name, that's fine

  if (l.entry.names.some((n) => n === l.name)) return; // If the name matches an alternate name, that's fine
  const simplifiedName = l.name.split(/[(/]/)[0].toLowerCase().trim(); // Try removing extra details
  if (l.entry.names.some((n) => n.toLowerCase() === simplifiedName)) return; // If the name matches an alternate name, that's fine

  l.issues.push(
    <>
      Name does not match an existing name for <HoverableObjectName object={l.entry} /> -- it will
      be added as an alternate name for search but should be checked for accuracy.
    </>,
  );
}

function checkStatusInName(l: CensusLanguageNotes) {
  if (!l.name) return;
  if (OKAY_STATUS.includes(l.specificCode || '')) return; // If the code is in the list of exceptions, don't raise an issue
  if (l.name.match(/official|indigenous|native/i)) {
    l.issues.push(
      'Name may contain status information that should not be included or it should be marked with an #',
    );
  }
}

function checkFoundLanguage(l: CensusLanguageNotes, foundLanguage?: EntityData) {
  if (!foundLanguage) return;
  l.codePathRec = foundLanguage.ID;
  if (l.entry?.ID === foundLanguage.ID) return; // If the found language is the same as the entry, that's fine

  if (l.entry) {
    l.issues.push(
      <>
        Code may be <code>{foundLanguage.ID}</code>? The language name matches{' '}
        <HoverableObjectName object={foundLanguage} /> but the code is for{' '}
        <HoverableObjectName object={l.entry} />. Check if the correct language is associated with
        this census entry.
      </>,
    );
  } else {
    l.issues.push(
      <>
        Code may be <code>{foundLanguage.ID}</code>? The language name matches{' '}
        <HoverableObjectName object={foundLanguage} /> and the code does not match a language. Check
        if the correct language is associated with this census entry.
      </>,
    );
  }
}

function checkMacrolanguage(l: CensusLanguageNotes, foundLanguage?: EntityData) {
  const matchingLang = l.entry || foundLanguage;
  const matchingCode = l.specificCode ?? l.codePathRec;
  if (!matchingLang || !matchingCode) return;

  const languageParents = getObjectParents(matchingLang).filter(
    (p) => p && p.type === 'Language',
  ) as LanguageData[];
  const iso639parents = languageParents.filter(
    (p) =>
      p.ISO.code && (p.scope === LanguageScope.Macrolanguage || p.scope === LanguageScope.Language),
  );

  if (!iso639parents || iso639parents.length === 0) return; // If there is no macrolanguage or language parents, then there is no issue
  if (OKAY_MACRO.includes(matchingCode || '')) return; // If the specific code is in the list of exceptions, don't warn
  const codePathRecommended = [...iso639parents.map((p) => p.ID), matchingCode].join('/');
  l.codePathRec = codePathRecommended;
  if (iso639parents.every((p) => l.codePath.includes(p.ID))) return; // If the macrolanguage code is already included in the code path, that's fine

  l.issues.push(
    <>
      Code may be <code>{codePathRecommended}</code>
      . <HoverableObjectName object={matchingLang} /> is contained by language
      {iso639parents.length > 1 ? ' categories ' : ' category '}
      <CommaSeparated>
        {iso639parents.map((p) => (
          <HoverableObjectName key={p.ID} object={p} />
        ))}
      </CommaSeparated>
      .
    </>,
  );
}

export default CensusLanguageCheck;
