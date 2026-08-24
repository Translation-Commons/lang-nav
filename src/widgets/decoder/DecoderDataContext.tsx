import React, { useCallback, useEffect, useState } from 'react';

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
  setInputLines: React.Dispatch<React.SetStateAction<string[]>>;
  // results: Record<string, DecoderResult>;
  getResult: (input: string) => DecoderResult | undefined;
  isSearchActive: boolean;
};

const DecoderDataContext = React.createContext<DecoderDataContextType>({
  inputBlob: '',
  setInputBlob: () => {},
  inputLines: [],
  setInputLines: () => {},
  getResult: () => undefined,
  isSearchActive: false,
});

export const useDecoderDataContext = () => React.useContext(DecoderDataContext);

export const DecoderDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { getLanguage } = useDataContext();
  const findLanguage = useFindLanguage();
  const { direction } = useDecoderOptionsContext();

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [inputBlob, setInputBlob] = useState(EXAMPLE_NAMES.split(',').join('\n'));
  const [inputLines, setInputLines] = useState(EXAMPLE_NAMES.split(','));
  const [results, setResults] = useState<Record<string, DecoderResult>>({});

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
      if (results[key]) return;

      const result = await search(searchString);
      setResults((prev) => ({ ...prev, [key]: result }));
    },
    [search],
  );

  // Effects, update the data when new input is provided or the direction changes
  useEffect(() => {
    // Swap the input lines from names to the codes currently matched
    if (Object.keys(results).length && inputLines.length) {
      const newBlob =
        direction === DecoderDirection.NamesToCodes
          ? inputLines
              .map((l) => results[l.toLowerCase().trim()]?.lang?.nameDisplay ?? '')
              .join('\n')
          : inputLines
              .map((l) => results[l.toLowerCase().trim()]?.lang?.codeDisplay ?? '')
              .join('\n');
      setInputBlob(newBlob);
      setResults({});
    }
  }, [direction]);
  useEffect(() => {
    setIsSearchActive(true);
    Promise.all(inputLines.map((line) => searchAndAdd(line))).then(() => setIsSearchActive(false));
  }, [inputLines]);

  return (
    <DecoderDataContext.Provider
      value={{ inputBlob, setInputBlob, inputLines, setInputLines, getResult, isSearchActive }}
    >
      {children}
    </DecoderDataContext.Provider>
  );
};

export default DecoderDataContext;
