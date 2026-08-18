import { useCallback, useEffect, useState } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import LanguageSourceSelector from '@features/transforms/filtering/selectors/LanguageSourceSelector';

import { LanguageData } from '@entities/language/LanguageTypes';

import useFindLanguage from './useFindLanguageFromName';

enum DecodeDirection {
  NamesToCodes,
  CodesToNames,
}

const EXAMPLE_CODES = `en,es,fr,zh,cmn,yue,ar,arb,arz`;

type LookupResult = {
  input: string;
  language?: LanguageData;
  alternatives?: LanguageData[];
};

const DecoderPageBody = () => {
  const { getLanguage } = useDataContext();
  const findLanguage = useFindLanguage();

  const [inputLines, setInputLines] = useState(EXAMPLE_CODES.split(',').join('\n'));
  const [lookupCache, setLookupCache] = useState<Record<string, LookupResult>>({});
  const [direction, setDirection] = useState(DecodeDirection.CodesToNames);
  const [languages, setLanguages] = useState<(LanguageData | undefined)[]>([]);

  // TODO: Show alternative suggestions if the exact match is not found
  const search = useCallback(
    async (searchString: string) => {
      const searchLower = searchString.toLowerCase();
      if (lookupCache[searchLower]) return lookupCache[searchLower];

      const lang =
        direction === DecodeDirection.NamesToCodes
          ? findLanguage(searchLower)
          : getLanguage(searchLower);
      if (lang) {
        setLookupCache((prev) => ({
          ...prev,
          [searchLower]: { input: searchLower, language: lang },
        }));
      }
      return { input: searchLower, language: lang };
    },
    [getLanguage, findLanguage, direction],
  );

  // Export functionality
  const copyToClipboard = (text: string | string[]) =>
    navigator.clipboard.writeText(Array.isArray(text) ? text.join('\n') : text);
  const copyResultingNames = useCallback(() => {
    copyToClipboard(languages.map((lang) => lang?.nameDisplay ?? ''));
  }, [languages]);
  const copyResultingCodes = useCallback(() => {
    copyToClipboard(languages.map((lang) => lang?.codeDisplay ?? ''));
  }, [languages]);

  // Effects, update the data when new input is provided or the direction changes
  useEffect(() => {
    // Clear the cache and results
    setLookupCache({});

    // Move results to the input box
    if (languages.length > 0)
      setInputLines(
        languages
          ? direction === DecodeDirection.NamesToCodes
            ? languages.map((lang) => lang?.nameDisplay ?? '').join('\n')
            : languages.map((lang) => lang?.codeDisplay ?? '').join('\n')
          : '',
      );
  }, [direction]);
  useEffect(() => {
    const lines = inputLines.split('\n').map((line) => line.trim());
    Promise.all(lines.map((line) => search(line))).then((results) =>
      setLanguages(results.map((r) => r.language)),
    );
    // make it cancellable
  }, [inputLines]);

  return (
    <div className="min-w-[900px] mx-auto px-4 py-4">
      <div className="text-3xl">Language Tag Decoder</div>
      <div>
        This tool allows you to get language names from language codes, and vice versa. You can
        paste a list of languages separated by newline.{' '}
        {direction === DecodeDirection.NamesToCodes ? (
          <>
            To find the proper language codes for language names, there may be multiple spellings or
            name constructions, so this will honor filter settings and find the best match.
          </>
        ) : (
          <>
            Language codes are matched to language names deterministically, following the ISO 639
            standard (3 letter or 2 letter), otherwise the glottocode.
          </>
        )}
      </div>
      <div>
        Options
        <LanguageSourceSelector display={SelectorDisplay.ButtonGroup} />
        <div className="flex gap-2">
          <button
            className={direction === DecodeDirection.NamesToCodes ? 'primary' : ''}
            onClick={() => setDirection(DecodeDirection.NamesToCodes)}
          >
            Names → Codes
          </button>
          <button
            className={direction === DecodeDirection.CodesToNames ? 'primary' : ''}
            onClick={() => setDirection(DecodeDirection.CodesToNames)}
          >
            Codes → Names
          </button>
        </div>
      </div>

      <div className="flex flex-row gap-4">
        <div>
          <br /> {/* for alignment */}
          Paste languages here
          <textarea
            className="w-full border p-2 min-h-100"
            value={inputLines}
            onChange={(e) => setInputLines(e.target.value)}
            placeholder="Paste a newline separated list of languages..."
          />
        </div>
        <div>
          Language Matches
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>LangNav Entry</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((lang, i) => (
                <tr key={i}>
                  <td>{lang?.codeDisplay}</td>
                  <td>
                    {lang ? <HoverableObjectName object={lang} labelSource="name" /> : 'Not found'}
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <button className="primary p-1! mr-1" onClick={copyResultingCodes}>
                    Copy codes
                  </button>
                </td>
                <td>
                  <button className="primary p-1!" onClick={copyResultingNames}>
                    Copy names
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DecoderPageBody;
