import React, { useMemo } from 'react';

import ResponsiveGrid from '@widgets/cardlists/ResponsiveGrid';

import LimitInput from '@features/pagination/LimitInput';
import PaginationControls from '@features/pagination/PaginationControls';
import usePagination from '@features/pagination/usePagination';
import { ObjectType } from '@features/params/PageParamTypes';
import useFilteredObjects from '@features/transforms/filtering/useFilteredObjects';
import { getSortFunction } from '@features/transforms/sorting/sort';
import TreeListRoot from '@features/treelist/TreeListRoot';

import { LanguageData, LanguageSource } from '@entities/language/LanguageTypes';

import CollapsibleReport from '@shared/containers/CollapsibleReport';
import ViewCard from '@shared/containers/ViewCard';
import { unique } from '@shared/lib/setUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageTreeNodes } from '../treelists/LanguageHierarchy';

const LanguagesWithIdenticalNames: React.FC = () => {
  const { filteredObjects: languages } = useFilteredObjects(ObjectType.Language, {});
  const sortFunction = getSortFunction();
  const { getCurrentObjects } = usePagination<[string, LanguageData[]]>();
  const languagesByName = useMemo(() => {
    return languages.reduce<Record<string, LanguageData[]>>((languagesByName, lang) => {
      const name = lang.nameDisplay;
      if (languagesByName[name] == null) {
        languagesByName[name] = [lang];
      } else {
        languagesByName[name].push(lang);
      }
      return languagesByName;
    }, {});
  }, [languages]);

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
      {getCurrentObjects(
        Object.entries(langsWithDupNames).sort((a, b) => {
          const aData = a[1][0];
          const bData = b[1][0];
          return aData != null && bData != null ? sortFunction(aData, bData) : 0;
        }),
      ).map(([name, langs]) => (
        <div key={name} style={{ marginBottom: '1em' }}>
          <h3 style={{ marginBottom: 0 }}>{name}</h3>
          <div className="CardList">
            <ResponsiveGrid>
              {langs.map((lang) => {
                const { ISO, Glottolog } = lang;
                const otherNames = lang.names.filter(
                  (name) => name !== lang.nameDisplay && name !== lang.nameEndonym,
                );
                return (
                  <ViewCard key={lang.ID}>
                    <div>
                      <label>ID(s):</label>{' '}
                      {unique(
                        [lang.ID, ISO.code, ISO.code6391, Glottolog.code].filter(
                          (id) => id != null,
                        ),
                      ).join(', ')}
                    </div>
                    <div>
                      <label>Other Names:</label>
                      <CommaSeparated>
                        {otherNames.length > 0 ? otherNames : <Deemphasized>none</Deemphasized>}
                      </CommaSeparated>
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
            </ResponsiveGrid>
          </div>
        </div>
      ))}
    </CollapsibleReport>
  );
};

export default LanguagesWithIdenticalNames;
