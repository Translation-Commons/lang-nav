import React, { useMemo } from 'react';

import CardInCardList from '@widgets/cardlists/CardInCardList';
import CardTitle from '@widgets/cardlists/CardTitle';
import ResponsiveGrid from '@widgets/cardlists/ResponsiveGrid';

import { useDataContext } from '@features/data/context/useDataContext';
import LimitInput from '@features/pagination/LimitInput';
import PaginationControls from '@features/pagination/PaginationControls';
import usePagination from '@features/pagination/usePagination';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';
import { useSortFunction } from '@features/transforms/sorting/sort';

import type { LanguageData } from '@entities/language/LanguageTypes';
import { LanguageModality } from '@entities/language/writing/LanguageModality';
import EntityCard from '@entities/ui/EntityCard';

const ReportWritingSystemsLanguagesWithout: React.FC = () => {
  const { languages } = useDataContext();
  const languagesFiltered = useFilteredEntities<LanguageData>({
    inputEnts: languages,
  }).filteredEntities;
  const sortFunction = useSortFunction();
  const { getCurrentEntities } = usePagination<LanguageData>();

  const languagesWithoutWritingSystems = useMemo(
    () =>
      languagesFiltered
        .filter((lang) => !lang.writingSystems || Object.keys(lang.writingSystems).length === 0)
        .filter((lang) => lang.modality !== LanguageModality.Sign),
    [languages, languagesFiltered],
  );

  return (
    <div className="flex flex-col gap-4">
      This report identifies languages without associated writing systems. Languages may be missing
      writing system data due to data gaps, incomplete ingestion from upstream sources, or because
      they are primarily oral. Extinct and historical languages often have harder-to-find writing
      system information. Sign languages are excluded from this report.
      <div className="flex items-center gap-4">
        <LimitInput />
        <div>
          <PaginationControls itemCount={languagesWithoutWritingSystems.length} />
        </div>
      </div>
      <ResponsiveGrid>
        {getCurrentEntities(languagesWithoutWritingSystems.sort(sortFunction)).map((lang) => {
          return (
            <CardInCardList key={lang.ID} ent={lang}>
              <div className="flex flex-col gap-2">
                <CardTitle ent={lang} />
                <EntityCard ent={lang} />
              </div>
            </CardInCardList>
          );
        })}
      </ResponsiveGrid>
    </div>
  );
};

export default ReportWritingSystemsLanguagesWithout;
