import React, { useMemo } from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import LimitInput from '@features/pagination/LimitInput';
import PaginationControls from '@features/pagination/PaginationControls';
import usePagination from '@features/pagination/usePagination';
import { getFilterBySubstring } from '@features/transforms/filtering/filter';
import { getFilterByConnections } from '@features/transforms/filtering/filterByConnections';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';

import CollapsibleReport from '@shared/containers/CollapsibleReport';
import ViewCard from '@shared/containers/ViewCard';
import Deemphasized from '@shared/ui/Deemphasized';

const DubiousLanguages: React.FC = () => {
  const { getLanguage, getTerritory, getWritingSystem, languagesInSelectedSource } =
    useDataContext();
  const filterBySubstring = getFilterBySubstring();
  const filterByConnections = getFilterByConnections();
  const sortFunction = getSortFunction();
  const { getCurrentObjects } = usePagination<LanguageData>();
  const languagesFiltered = useMemo(
    () =>
      languagesInSelectedSource
        .filter(filterBySubstring)
        .filter(filterByConnections)
        .filter((lang) => lang.codeDisplay.match('xx.-|^[0-9]')),
    [languagesInSelectedSource, filterBySubstring, filterByConnections],
  );

  return (
    <CollapsibleReport title={`Dubious languages (${languagesFiltered.length})`}>
      These languages have strange language codes and maybe should be removed from the list of
      languages. Some possibilities are:
      <ol>
        <li>
          It may be a dialect that doesn&apos;t have a standard ISO code. There may be a glottocode
          instead -- in that case it&apos;s probably redundant.
        </li>
        <li>
          If it is a combination of a language + territory, it is probably a locale incorrectly
          saved to the language list. Add the locale if it does not yet exist then remove the entry
          from the language list.
        </li>
        <li>
          If it is a combination of a language + writing system, it is probably there to represent
          an non-standard writing system used to write that language. We have not yet imported
          writing system alternatives so we cannot add that data yet.
        </li>
      </ol>
      <div>
        <LimitInput />
        <PaginationControls itemCount={languagesFiltered.length} />
      </div>
      <div className="CardList" style={{ marginBottom: '1em' }}>
        {getCurrentObjects(languagesFiltered.sort(sortFunction)).map((lang) => {
          const codePieces = lang.codeDisplay.split(/-|_/);
          const relatedObjects = codePieces
            .map(
              (partialCode) =>
                getLanguage(partialCode) ??
                getTerritory(partialCode) ??
                getWritingSystem(partialCode),
            )
            .filter((object) => object != null);
          // TODO if its a language + territory, check if the locale exists
          // TODO check if there is an IANA variant tag.
          return (
            <ViewCard key={lang.ID}>
              <div>
                <label>Names:</label>
                {lang.nameDisplay}
              </div>
              <div>
                <label>Language Code:</label>
                {lang.codeDisplay}
              </div>
              <div>
                <label>Population:</label>
                {lang.populationEstimate || <Deemphasized>no population</Deemphasized>}
              </div>
              <div>
                <label>Potentially related objects:</label>
                <ul style={{ margin: 0 }}>
                  {relatedObjects.length > 0 ? (
                    relatedObjects.map((obj) => (
                      <li key={obj.ID}>
                        <HoverableObjectName object={obj} labelSource="code" />
                      </li>
                    ))
                  ) : (
                    <Deemphasized>none</Deemphasized>
                  )}
                </ul>
              </div>
            </ViewCard>
          );
        })}
      </div>
    </CollapsibleReport>
  );
};

export default DubiousLanguages;
