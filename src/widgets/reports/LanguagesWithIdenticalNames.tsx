import React, { useMemo } from 'react';

import LimitInput from '@widgets/controls/selectors/LimitInput';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import {
  getFilterBySubstring,
  getFilterByTerritory,
  getSliceFunction,
} from '@features/filtering/filter';
import PaginationControls from '@features/pagination/PaginationControls';
import { getSortFunction } from '@features/sorting/sort';
import TreeListRoot from '@features/treelist/TreeListRoot';

import { LanguageData, LanguageSource } from '@entities/language/LanguageTypes';

import CollapsibleReport from '@shared/containers/CollapsibleReport';
import ViewCard from '@shared/containers/ViewCard';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageTreeNodes } from '../treelists/LanguageHierarchy';

const LanguagesWithIdenticalNames: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();
  const filterBySubstring = getFilterBySubstring();
  const filterByTerritory = getFilterByTerritory();
  const sortFunction = getSortFunction();
  const sliceFunction = getSliceFunction<[string, LanguageData[]]>();
  const languagesByName = useMemo(() => {
    return languagesInSelectedSource
      .filter(filterBySubstring)
      .filter(filterByTerritory)
      .reduce<Record<string, LanguageData[]>>((languagesByName, lang) => {
        const name = lang.nameDisplay;
        if (languagesByName[name] == null) {
          languagesByName[name] = [lang];
        } else {
          languagesByName[name].push(lang);
        }
        return languagesByName;
      }, {});
  }, [languagesInSelectedSource, filterBySubstring, filterByTerritory]);
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
    <CollapsibleReport
      title={`Languages with identical names (${Object.keys(langsWithDupNames).length})`}
    >
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
        <PaginationControls itemCount={Object.keys(langsWithDupNames).length} />
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
              const { ISO, Glottolog } = lang.sourceSpecific;
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
                        rootNodes={getLanguageTreeNodes([lang], LanguageSource.ISO, sortFunction)}
                      />
                    </div>
                  )}
                  {Glottolog.code != null && (
                    <div>
                      Glottolog Hierarchy:{' '}
                      <TreeListRoot
                        rootNodes={getLanguageTreeNodes(
                          [lang],
                          LanguageSource.Glottolog,
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
    </CollapsibleReport>
  );
};

export default LanguagesWithIdenticalNames;
