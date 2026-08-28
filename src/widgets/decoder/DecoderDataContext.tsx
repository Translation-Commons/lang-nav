import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { EntityType } from '@features/params/PageParamTypes';

import type { LanguageData } from '@entities/language/LanguageTypes';

import { getDecoderMacroCode } from './DecoderMacrolanguage';
import DecoderResult from './DecoderResult';
import { DecoderDirection, useDecoderOptionsContext } from './options/DecoderOptionsContext';
import useFindLanguage from './useFindLanguageFromName';

const EXAMPLE_NAMES =
  'English\nSpanish\nFrench\n' +
  'Chinese\nMandarin\nPutonghua\nCantonese\nHokkien\nTaiwanese\n' +
  'Arabic\nDarija\nStandard Arabic\nEgyptian Arabic\n' +
  'Malay\nIndonesian\nBahasa\n' +
  'Bembe\nBemb\nTonga\nTonga (Tonga)\nTonga (Tonga Islands)\n' +
  'Naʼvi\nSindarin\nQuenya';
const EXAMPLE_CODES = 'en\neng\ncmn\nzh-cmn\nzh\nchi\nzho\nclas1255\nzhx\nsit';

type DecoderDataContextType = {
  inputBlob: string;
  setInputBlob: React.Dispatch<React.SetStateAction<string>>;
  inputLines: string[];
  getResult: (input: string) => DecoderResult | undefined;
  search: (input: string) => Promise<DecoderResult>;
  isInputPending: boolean;
  isSearchActive: boolean;
};

const DecoderDataContext = React.createContext<DecoderDataContextType>({
  inputBlob: '',
  setInputBlob: () => {},
  inputLines: [],
  getResult: () => undefined,
  search: async (input: string) => ({ input, lang: undefined, alts: [] }),
  isInputPending: false,
  isSearchActive: false,
});

export const useDecoderDataContext = () => React.useContext(DecoderDataContext);

export const DecoderDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { getLanguage } = useDataContext();
  const findLanguage = useFindLanguage();
  const { direction } = useDecoderOptionsContext();

  const [isTransitionPending, startTransition] = useTransition();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [inputBlob, setInputBlob] = useState(EXAMPLE_NAMES);
  const [results, setResults] = useState<Record<string, DecoderResult>>({});
  const [searchVersion, setSearchVersion] = useState(0);
  const hasInitializedSearchRef = useRef(false);
  const resultsRef = useRef(results);
  const deferredInputBlob = React.useDeferredValue(inputBlob);
  const inputLines = useMemo(() => deferredInputBlob.split('\n'), [deferredInputBlob]);
  const isInputPending = inputBlob !== deferredInputBlob || isTransitionPending;

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  const getResult = useCallback((input: string) => results[input.toLowerCase().trim()], [results]);
  const search = useCallback(
    async (searchString: string): Promise<DecoderResult> => {
      const searchLower = searchString.toLowerCase().trim();
      if (searchLower === '' || searchLower.startsWith('#'))
        return { input: searchLower, lang: undefined, alts: [] };

      let lang = undefined;
      let alts: LanguageData[] = [];

      if (direction === DecoderDirection.NamesToCodes) {
        const found = await findLanguage(searchLower);
        lang = found[0];
        alts = found.slice(1, 10);
      } else {
        lang = getLanguage(searchLower);
        if (lang?.CLDR.dataProvider?.type === EntityType.Language) alts = [lang.CLDR.dataProvider];
      }
      const { codeWithMacro } = getDecoderMacroCode(lang, lang?.codeDisplay) ?? {};
      return { input: searchLower, lang, alts, codeWithMacro };
    },
    [getLanguage, findLanguage, direction],
  );
  const searchAndAdd = useCallback(
    async (searchString: string) => {
      const key = searchString.toLowerCase().trim();
      if (resultsRef.current[key]) return;

      const result = await search(searchString);
      startTransition(() => setResults((prev) => ({ ...prev, [key]: result })));
    },
    [search, startTransition],
  );

  useEffect(() => {
    startTransition(() => {
      setInputBlob(direction === DecoderDirection.NamesToCodes ? EXAMPLE_NAMES : EXAMPLE_CODES);
      setResults({});
    });
    resultsRef.current = {};
    setSearchVersion((prev) => prev + 1);
  }, [direction, startTransition]);

  useEffect(() => {
    if (!hasInitializedSearchRef.current) {
      hasInitializedSearchRef.current = true;
      return;
    }

    startTransition(() => {
      setResults({});
    });
    resultsRef.current = {};
    setSearchVersion((prev) => prev + 1);
  }, [search, startTransition]);

  useEffect(() => {
    let cancelled = false;
    const linesToSearch = [...new Set(inputLines.map((line) => line.toLowerCase().trim()))];
    const missingLines = linesToSearch.filter((line) => !resultsRef.current[line]);

    if (missingLines.length === 0) {
      setIsSearchActive(false);
      return;
    }

    setIsSearchActive(true);
    Promise.all(missingLines.map((line) => searchAndAdd(line))).finally(() => {
      if (!cancelled) setIsSearchActive(false);
    });

    return () => {
      cancelled = true;
    };
  }, [inputLines, searchAndAdd, searchVersion]);

  return (
    <DecoderDataContext.Provider
      value={{
        inputBlob,
        setInputBlob,
        inputLines,
        getResult,
        isInputPending,
        isSearchActive,
        search,
      }}
    >
      {children}
    </DecoderDataContext.Provider>
  );
};

export default DecoderDataContext;
