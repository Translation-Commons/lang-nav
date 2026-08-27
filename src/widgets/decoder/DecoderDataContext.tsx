import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { EntityType } from '@features/params/PageParamTypes';

import type { LanguageData } from '@entities/language/LanguageTypes';

import { getDecoderMacroCode } from './DecoderMacrolanguage';
import DecoderResult from './DecoderResult';
import { DecoderDirection, useDecoderOptionsContext } from './options/DecoderOptionsContext';
import useFindLanguage from './useFindLanguageFromName';

const EXAMPLE_NAMES =
  'English,Spanish,French' +
  ',Chinese,Mandarin,Putonghua,Cantonese,Hokkien,Taiwanese' +
  ',Arabic,Darija,Standard Arabic,Egyptian Arabic' +
  ',Malay,Indonesian,Bahasa' +
  ',Bembe,Bemb,Tonga,Tonga (Tonga),Tonga (Tonga Islands)' +
  ',Elvish,Sindarin,Quenya';

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
  const [inputBlob, setInputBlob] = useState(EXAMPLE_NAMES.split(',').join('\n'));
  const [results, setResults] = useState<Record<string, DecoderResult>>({});
  const resultsRef = useRef(results);
  const deferredInputBlob = React.useDeferredValue(inputBlob);
  const inputLines = useMemo(() => deferredInputBlob.split('\n'), [deferredInputBlob]);
  console.log(inputLines);
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
    startTransition(() => setResults({}));
  }, [direction, startTransition]);

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
  }, [inputLines, searchAndAdd]);

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
