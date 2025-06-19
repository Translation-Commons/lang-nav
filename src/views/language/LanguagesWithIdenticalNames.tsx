import React from 'react';

import { getSliceFunction, getSubstringFilter } from '../../controls/filter';
import { usePageParams } from '../../controls/PageParamsContext';
import LimitInput from '../../controls/selectors/LimitInput';
import PaginationControls from '../../controls/selectors/PaginationControls';
import { getSortFunction } from '../../controls/sort';
import { useDataContext } from '../../data/DataContext';
import CommaSeparated from '../../generic/CommaSeparated';
import Deemphasized from '../../generic/Deemphasized';
import { LanguageData, LanguageSchema } from '../../types/LanguageTypes';
import TreeListRoot from '../common/TreeList/TreeListRoot';
import ViewCard from '../ViewCard';

import { getLanguageTreeNodes } from './LanguageHierarchy';

const LanguagesWithIdenticalNames: React.FC = () => {
  const {
    languagesBySchema: { Inclusive },
  } = useDataContext();
  const { page, limit } = usePageParams();
  const filterFunction = getSubstringFilter() ?? (() => true);
  const sortFunction = getSortFunction();
  const sliceFunction = getSliceFunction<[string, LanguageData[]]>();
  const languagesByName = Object.values(Inclusive)
    .filter(filterFunction)
    .reduce<Record<string, LanguageData[]>>((languagesByName, lang) => {
      const name = lang.nameDisplay;
      if (languagesByName[name] == null) {
        languagesByName[name] = [lang];
      } else {
        languagesByName[name].push(lang);
      }
      return languagesByName;
    }, {});
  const langsWithDupNames = Object.entries(languagesByName).reduce<Record<string, LanguageData[]>>(
    (duplicatedNames, [name, langs]) => {
      if (langs.length > 1) {
        duplicatedNames[name] = langs;
      }
      return duplicatedNames;
    },
    {},
  );

  return (
    <details>
      <summary>Languages with identical names ({Object.keys(langsWithDupNames).length})</summary>
      The following languages have identical names. This can happen when merging data from multiple
      sources. It gets confusing to find the right language when names overlap. To fix this we
      should change names with these possible options:
      <ol>
        <li>
          Use language family names e.g. Japanese &#8594; Japonic, Bantu &#8594; Bantuoid. Only if
          that name is understood -- don&apos;t invent names, let the academics do that.
        </li>
        <li>
          Append term in parentheses to distiniguish the scope for the rarer term eg. Malay
          (macrolanguage), Malay (individual language)
        </li>
        <li>Append territory name in parentheses eg. Tonga (Malawi), Tonga (Tonga Islands)</li>
        <li>
          Some entries may correspond to language fragments that maybe should not be in the list and
          be removed.
        </li>
      </ol>
      <div>
        <LimitInput />
        <PaginationControls
          currentPage={page}
          totalPages={limit < 1 ? 1 : Math.ceil(Object.keys(langsWithDupNames).length / limit)}
        />
      </div>
      {sliceFunction(
        Object.entries(langsWithDupNames).sort((a, b) => {
          const aData = a[1][0];
          const bData = b[1][0];
          return aData != null && bData != null ? sortFunction(aData, bData) : 0;
        }),
      ).map(([name, langs]) => (
        <div key={name} style={{ marginBottom: '1em' }}>
          <h3 style={{ marginBottom: 0 }}>{name}</h3>
          <div className="CardList">
            {langs.map((lang) => {
              const { ISO, Glottolog } = lang.schemaSpecific;
              const otherNames = lang.names.filter(
                (name) => name !== lang.nameDisplay && name !== lang.nameEndonym,
              );
              return (
                <ViewCard key={lang.ID}>
                  <div>
                    <label>Other Names:</label>
                    <CommaSeparated>
                      {otherNames.length > 0 ? otherNames : <Deemphasized>none</Deemphasized>}
                    </CommaSeparated>
                  </div>
                  <div>
                    <label>ISO code:</label>
                    {ISO.code}
                  </div>
                  <div>
                    <label>Glottocode:</label>
                    {Glottolog.code}
                  </div>
                  <div>
                    <label>Scope:</label>
                    {lang.scope ?? <Deemphasized>Unknown</Deemphasized>}
                  </div>
                  {ISO.code != null && (
                    <div>
                      ISO Hierarchy:{' '}
                      <TreeListRoot
                        rootNodes={getLanguageTreeNodes([lang], LanguageSchema.ISO, sortFunction)}
                      />
                    </div>
                  )}
                  {Glottolog.code != null && (
                    <div>
                      Glottolog Hierarchy:{' '}
                      <TreeListRoot
                        rootNodes={getLanguageTreeNodes(
                          [lang],
                          LanguageSchema.Glottolog,
                          sortFunction,
                        )}
                      />
                    </div>
                  )}
                </ViewCard>
              );
            })}
          </div>
        </div>
      ))}
    </details>
  );
};

export default LanguagesWithIdenticalNames;
