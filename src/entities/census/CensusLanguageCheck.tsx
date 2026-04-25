import React, { ReactNode, useCallback } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { SearchableField } from '@features/params/PageParamTypes';
import useFilteredObjects from '@features/transforms/filtering/useFilteredObjects';
import getSubstringFilterOnQuery from '@features/transforms/search/getSubstringFilterOnQuery';

import { getLanguageRootMacrolanguage } from '@entities/language/LanguageFamilyUtils';
import { LanguageData } from '@entities/language/LanguageTypes';
import { EntityData } from '@entities/types/DataTypes';

import { isIgnoredLanguageCode, parseCensusLanguageName } from './parseCensusLanguageRow';
import { parseCensusMetadata } from './parseCensusMetadata';

// These language codes won't raise errors because the issues are known to be misleading
const OKAY_STATUS = ['aus'];
const OKAY_MACRO = ['mlt', 'mar', 'tgk'];
const OVERRIDE_LANGUAGE_MATCH: Record<string, string> = {
  hokkien: 'taib1242',
  teochew: 'chao1238',
  malay: 'zlm',
};

type LanguageNotes = {
  lineNumber: number;
  codePath: string; // allowing for /-separated codes
  specificCode?: string; // the most specific code (eg. `srp` in `hbs/srp`) which will be used for the language name
  originalName: string;
  name?: string;
  entry?: LanguageData;
  issues: ReactNode[];
};

const CensusLanguageCheck: React.FC<{ fileInput: string }> = ({ fileInput }) => {
  const lines = fileInput.split('\n');
  const { endOfMetadataLine } = parseCensusMetadata(lines, 'census');
  const { getLanguage, languagesInSelectedSource } = useDataContext();
  const { filteredObjects: languageEnts } = useFilteredObjects({
    inputObjects: languagesInSelectedSource,
  });
  const findLanguage = useCallback(
    (searchString: string) => {
      if (OVERRIDE_LANGUAGE_MATCH[searchString.toLowerCase()]) {
        const overrideCode = OVERRIDE_LANGUAGE_MATCH[searchString.toLowerCase()];
        const overrideLang = languageEnts.find((l) => l.ID === overrideCode);
        if (overrideLang) return overrideLang;
      }
      const ents = languageEnts.filter(
        getSubstringFilterOnQuery(searchString, SearchableField.NameAny),
      );
      const exactMatch = ents.find(
        (e) => e.nameDisplay.toLowerCase() === searchString.toLowerCase(),
      );
      if (exactMatch) return exactMatch;
      const matchInList = ents.find((e) =>
        e.names.some((n) => n.toLowerCase() === searchString.toLowerCase()),
      );
      if (matchInList) return matchInList;
      return ents[0];
    },
    [languageEnts],
  );

  const languages = lines
    .splice(endOfMetadataLine)
    .map((line, i) => {
      if (line.trim() === '') return null; // Skip empty lines
      const parts = line.split('\t');
      if (parts.length < 3) return null; // Skip lines that do not have enough data

      // Most rows specify a single language code (eg. `eng`), but some specify multiple codes separated by a slash (eg. `hbs/srp`)
      const codes = parts[0]
        // split if it is not contained in parentheses
        .split(/\/(?![^(]*\))/)
        .map((code) => code.trim())
        .filter(Boolean);
      // The most specific code is the last one (eg. `srp` in `hbs/srp`)
      const specificCode = codes.length > 0 ? codes[codes.length - 1] : undefined;

      return {
        lineNumber: i + endOfMetadataLine + 1,
        codePath: parts[0],
        specificCode,
        originalName: parts[1].trim(),
        name: parseCensusLanguageName(parts[1].trim()),
        entry: specificCode ? getLanguage(specificCode) : undefined,
        issues: [],
      } as LanguageNotes;
    })
    .filter((l) => l != null) as LanguageNotes[];
  const allSpecificCodes = languages.map((l) => l.specificCode).filter((c) => c != null);

  languages.forEach((l) => {
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

    checkName(l);
    checkStatusInName(l);
    checkFoundLanguage(l, l.name ? findLanguage(l.name) : undefined);
    checkMacrolanguage(l, allSpecificCodes);
  });

  if (!languages.some((l) => l.issues.length > 0)) {
    return <div>No issues found with language codes or names.</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Line</th>
          <th>Language Code(s)</th>
          <th>Language Name in Census</th>
          <th>Issues</th>
        </tr>
      </thead>
      <tbody>
        {languages.map(
          (l, i) =>
            l.issues.length > 0 && (
              <tr key={i}>
                <td>{l.lineNumber}</td>
                <td>{l.codePath}</td>
                <td>{l.name}</td>
                <td>
                  {l.issues.map((issue, index) => (
                    <div key={index}>{issue}</div>
                  ))}
                </td>
              </tr>
            ),
        )}
      </tbody>
    </table>
  );
};

function checkName(l: LanguageNotes) {
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

function checkStatusInName(l: LanguageNotes) {
  if (!l.name) return;
  if (OKAY_STATUS.includes(l.specificCode || '')) return; // If the code is in the list of exceptions, don't raise an issue
  if (l.name.match(/official|indigenous|native/i)) {
    l.issues.push(
      'Name may contain status information that should not be included or it should be marked with an #',
    );
  }
}

function checkFoundLanguage(l: LanguageNotes, foundLanguage?: EntityData) {
  if (!foundLanguage) return;
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

function checkMacrolanguage(l: LanguageNotes, allSpecificCodes: string[]) {
  if (!l.entry || !l.specificCode) return;

  const macrolanguage = getLanguageRootMacrolanguage(l.entry);
  if (!macrolanguage) return; // If there is no macrolanguage, then there is no issue
  if (macrolanguage.ID === l.specificCode) return; // If the language itself is a macrolanguage, that's fine
  if (l.codePath.includes(macrolanguage.ID)) return; // If the macrolanguage code is already included in the code path, that's fine
  if (allSpecificCodes.includes(macrolanguage.ID)) return; // If the macrolanguage is listed separately, don't warn
  if (OKAY_MACRO.includes(l.specificCode || '')) return; // If the specific code is in the list of exceptions, don't warn

  l.issues.push(
    <>
      Code may be{' '}
      <code>
        {macrolanguage.ID}/{l.codePath}
      </code>
      . <HoverableObjectName object={l.entry} /> is part of the{' '}
      <HoverableObjectName object={macrolanguage} /> macrolanguage.
    </>,
  );
}

export default CensusLanguageCheck;
