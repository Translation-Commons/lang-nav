import React from 'react';

import { getSliceFunction, getSubstringFilter } from '../../controls/filter';
import { usePageParams } from '../../controls/PageParamsContext';
import LimitInput from '../../controls/selectors/LimitInput';
import PaginationControls from '../../controls/selectors/PaginationControls';
import { getSortFunction } from '../../controls/sort';
import { useDataContext } from '../../data/DataContext';
import Deemphasized from '../../generic/Deemphasized';
import { LanguageData } from '../../types/LanguageTypes';
import HoverableObjectName from '../common/HoverableObjectName';
import ViewCard from '../ViewCard';

const DubiousLanguages: React.FC = () => {
  const {
    languagesBySchema: { Inclusive, CLDR },
    writingSystems,
    territories,
  } = useDataContext();
  const { page, limit } = usePageParams();
  const filterFunction = getSubstringFilter() ?? (() => true);
  const sortFunction = getSortFunction();
  const sliceFunction = getSliceFunction<LanguageData>();
  const languages = Object.values(Inclusive)
    .filter(filterFunction)
    .filter((lang) => lang.codeDisplay.match('xx.-|^[0-9]'));

  return (
    <details>
      <summary>Dubious languages ({languages.length})</summary>
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
        <PaginationControls
          currentPage={page}
          totalPages={limit < 1 ? 1 : Math.ceil(languages.length / limit)}
        />
      </div>
      <div className="CardList" style={{ marginBottom: '1em' }}>
        {sliceFunction(languages.sort(sortFunction)).map((lang) => {
          const codePieces = lang.codeDisplay.split(/-|_/);
          const relatedObjects = codePieces
            .map(
              (partialCode) =>
                Inclusive[partialCode] ??
                CLDR[partialCode] ??
                territories[partialCode] ??
                writingSystems[partialCode],
            )
            .filter(Boolean);
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
                {lang.populationCited ?? <Deemphasized>no population</Deemphasized>}
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
    </details>
  );
};

export default DubiousLanguages;
