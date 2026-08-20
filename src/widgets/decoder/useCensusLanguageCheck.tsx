import React, { ReactNode, useEffect, useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import {
  isIgnoredLanguageCode,
  parseCensusLanguageName,
} from '@entities/census/parseCensusLanguageRow';
import { parseCensusMetadata } from '@entities/census/parseCensusMetadata';
import { LanguageData } from '@entities/language/LanguageTypes';
import { EntityData } from '@entities/types/DataTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

import { getDecoderMacroCode } from './DecoderMacrolanguage';
import useFindLanguageFromName from './useFindLanguageFromName';

// These language codes won't raise errors because the issues are known to be misleading
const OKAY_STATUS = ['aus'];

export type CensusLanguageNotes = {
  i: number; // index amongst the language section
  lineNumber: number; // offset from the top of the page
  codePath: string; // allowing for /-separated codes
  codePathRec?: string;
  specificCode?: string; // the most specific code (eg. `srp` in `hbs/srp`) which will be used for the language name
  originalName: string;
  name?: string;
  entry?: LanguageData;
  issues: ReactNode[];
};

const useCensusLanguageCheck = (fileInput: string): (CensusLanguageNotes | undefined)[] => {
  const lines = useMemo(() => fileInput.split('\n'), [fileInput]);
  const { endOfMetadataLine, singleColumnMode } = parseCensusMetadata(lines, 'census');
  const { getLanguage } = useDataContext();
  const findLanguageFromName = useFindLanguageFromName();
  const [languageEvaluations, setLanguageEvaluations] = React.useState<
    (CensusLanguageNotes | undefined)[]
  >([]);

  useEffect(() => {
    Promise.all(
      lines.map((line, i) => {
        // Create a copy to avoid mutating state directly
        const ln = getBaseNotes(line, i, endOfMetadataLine, singleColumnMode === true, getLanguage);
        if (!ln) return undefined;
        return advancedEvaluation(ln, findLanguageFromName);
      }),
    ).then((results) => setLanguageEvaluations(results));
  }, [lines, singleColumnMode, endOfMetadataLine, getLanguage, findLanguageFromName]);

  return languageEvaluations;
};

function getBaseNotes(
  line: string,
  i: number,
  endOfMetadataLine: number,
  singleColumnMode: boolean,
  getLanguage: (code: string) => LanguageData | undefined,
): CensusLanguageNotes | undefined {
  if (line.trim() === '') return undefined; // Skip empty lines
  const parts = line.split('\t');
  if (!singleColumnMode && parts.length < 2) return undefined; // Skip lines that do not have enough data

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
    i,
    lineNumber: i + endOfMetadataLine + 1,
    codePath: !singleColumnMode ? parts[0] : '',
    specificCode,
    originalName,
    name: parseCensusLanguageName(originalName),
    entry: specificCode ? getLanguage(specificCode) : undefined,
    issues: [],
  } as CensusLanguageNotes;
}

async function advancedEvaluation(
  ln: CensusLanguageNotes,
  findLanguageFromName: (code: string) => Promise<LanguageData[]>,
): Promise<CensusLanguageNotes | undefined> {
  if (!ln) return undefined;

  if (!ln.name && !ln.specificCode) {
    ln.issues.push('Language name and code are missing but there appears to be data in the row.');
    return ln;
  }
  if (ln.name && !ln.name.startsWith('#')) {
    if (!ln.specificCode) {
      ln.issues.push(
        'Language code is missing, but there is a language name -- check if the language code can be identified and added to the data.',
      );
    }
  }

  // Commented out codes and ones for special codes are there for documentation but are ignored in the import.
  if (ln.specificCode && isIgnoredLanguageCode(ln.specificCode)) return ln;

  await findLanguageFromName(ln.name ?? '').then((foundLanguages) => {
    const foundLanguage = foundLanguages?.[0];
    checkName(ln);
    checkStatusInName(ln);
    checkFoundLanguage(ln, foundLanguage);
    checkMacrolanguage(ln, foundLanguage);
  });
  return ln;
}

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

function checkMacrolanguage(l: CensusLanguageNotes, foundLanguage?: LanguageData) {
  const matchingLang = l.entry || foundLanguage;
  const matchingCode = l.specificCode ?? l.codePathRec;
  if (!matchingLang || !matchingCode) return;

  const { codeWithMacro, parentLangs } = getDecoderMacroCode(matchingLang, matchingCode) || {};
  if (!codeWithMacro || !parentLangs) return; // If there is no recommended code path, then there is no issue
  l.codePathRec = codeWithMacro;
  if (parentLangs.every((p) => l.codePath.includes(p.ID))) return; // If the macrolanguage code is already included in the code path, that's fine

  l.issues.push(
    <>
      Code may be <code>{codeWithMacro}</code>
      . <HoverableObjectName object={matchingLang} /> is contained by language
      {parentLangs.length > 1 ? ' categories ' : ' category '}
      <CommaSeparated>
        {parentLangs.map((p) => (
          <HoverableObjectName key={p.ID} object={p} />
        ))}
      </CommaSeparated>
      .
    </>,
  );
}

export default useCensusLanguageCheck;
