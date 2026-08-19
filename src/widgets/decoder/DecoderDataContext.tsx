import React, { useCallback, useEffect, useState } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { ObjectType } from '@features/params/PageParamTypes';

import type { LanguageData } from '@entities/language/LanguageTypes';

import { DecoderDirection, useDecoderOptionsContext } from './DecoderOptionsContext';
import DecoderResult from './DecoderResult';
import useFindLanguage from './useFindLanguageFromName';

const EXAMPLE_NAMES = `English,Spanish,French,Chinese,Mandarin,Cantonese,Arabic,Darija,Standard Arabic,Egyptian Arabic`;

type DecoderDataContextType = {
  inputLines: string;
  setInputLines: React.Dispatch<React.SetStateAction<string>>;
  results: DecoderResult[];
};

const DecoderDataContext = React.createContext<DecoderDataContextType>({
  inputLines: '',
  setInputLines: () => {},
  results: [],
});

export const useDecoderDataContext = () => React.useContext(DecoderDataContext);

export const DecoderDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { getLanguage } = useDataContext();
  const findLanguage = useFindLanguage();
  const { direction } = useDecoderOptionsContext();

  const [inputLines, setInputLines] = useState(EXAMPLE_NAMES.split(',').join('\n'));
  const [lookupCache, setLookupCache] = useState<Record<string, DecoderResult>>({});
  const [results, setResults] = useState<DecoderResult[]>([]);

  const search = useCallback(
    async (searchString: string) => {
      const searchLower = searchString.toLowerCase().trim();
      if (searchLower === '') return { input: searchLower, lang: undefined, alts: [] };
      if (lookupCache[searchLower]) return lookupCache[searchLower];

      let lang = undefined;
      let alts: LanguageData[] = [];

      if (direction === DecoderDirection.NamesToCodes) {
        const found = findLanguage(searchLower);
        lang = found[0];
        alts = found.slice(1);
      } else {
        lang = getLanguage(searchLower);
        if (lang?.CLDR.dataProvider?.type === ObjectType.Language) alts = [lang.CLDR.dataProvider];
      }
      if (lang) {
        setLookupCache((prev) => ({
          ...prev,
          [searchLower]: { input: searchLower, lang, alts },
        }));
      }
      return { input: searchLower, lang, alts };
    },
    [getLanguage, findLanguage, direction],
  );

  // Effects, update the data when new input is provided or the direction changes
  useEffect(() => {
    // Clear the cache and results
    setLookupCache({});

    // Move results to the input box
    if (results.length > 0)
      setInputLines(
        direction === DecoderDirection.NamesToCodes
          ? results.map((r) => r.lang?.nameDisplay ?? '').join('\n')
          : results.map((r) => r.lang?.codeDisplay ?? '').join('\n'),
      );
  }, [direction]);
  useEffect(() => {
    const lines = inputLines.split('\n').map((line) => line.trim());
    Promise.all(lines.map((line) => search(line))).then(setResults);
    // intentionally not updating when search updates
  }, [inputLines]);

  return (
    <DecoderDataContext.Provider value={{ inputLines, setInputLines, results }}>
      {children}
    </DecoderDataContext.Provider>
  );
};

export default DecoderDataContext;
