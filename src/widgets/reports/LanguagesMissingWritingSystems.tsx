import React, { useMemo } from 'react';

import ResponsiveGrid from '@widgets/cardlists/ResponsiveGrid';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import LimitInput from '@features/pagination/LimitInput';
import PaginationControls from '@features/pagination/PaginationControls';
import usePagination from '@features/pagination/usePagination';
import { getFilterByVitality, getScopeFilter } from '@features/transforms/filtering/filter';
import { getFilterByConnections } from '@features/transforms/filtering/filterByConnections';
import getFilterBySubstring from '@features/transforms/search/getFilterBySubstring';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { getLanguageRootLanguageFamily } from '@entities/language/LanguageFamilyUtils';
import { LanguageModality } from '@entities/language/LanguageModality';
import { getModalityLabel } from '@entities/language/LanguageModalityDisplay';
import { LanguageData } from '@entities/language/LanguageTypes';
import { getLanguageISOStatusLabel } from '@entities/language/vitality/VitalityStrings';

import CollapsibleReport from '@shared/containers/CollapsibleReport';
import ViewCard from '@shared/containers/ViewCard';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

const LanguagesMissingWritingSystems: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();
  const filterBySubstring = getFilterBySubstring();
  const filterByConnections = getFilterByConnections();
  const filterByScope = getScopeFilter();
  const filterByVitality = getFilterByVitality();
  const sortFunction = getSortFunction();
  const { getCurrentObjects } = usePagination<LanguageData>();

  const languagesFiltered = useMemo(
    () =>
      languagesInSelectedSource
        .filter(filterBySubstring)
        .filter(filterByConnections)
        .filter(filterByScope)
        .filter(filterByVitality)
        .filter((lang) => !lang.writingSystems || Object.keys(lang.writingSystems).length === 0)
        .filter((lang) => lang.modality !== LanguageModality.Sign),
    [languagesInSelectedSource, filterBySubstring, filterByConnections, filterByScope],
  );

  return (
    <CollapsibleReport title={`Languages missing writing systems (${languagesFiltered.length})`}>
      This report identifies languages without associated writing systems. Languages may be missing
      writing system data due to data gaps, incomplete ingestion from upstream sources, or because
      they are primarily oral. Extinct and historical languages often have harder-to-find writing
      system information. Sign languages are excluded from this report.
      <div style={{ display: 'flex', alignItems: 'center', gap: '1em', marginTop: '1em' }}>
        <LimitInput />
        <div>
          <PaginationControls itemCount={languagesFiltered.length} />
        </div>
      </div>
      <div style={{ marginTop: '1em', marginBottom: '1em' }}>
        <ResponsiveGrid>
          {getCurrentObjects(languagesFiltered.sort(sortFunction)).map((lang) => {
            const family = getLanguageRootLanguageFamily(lang);
            return (
              <ViewCard key={lang.ID}>
                <div>
                  <label>Language ID:</label>
                  {lang.ID}
                </div>
                <div>
                  <label>Language Name:</label>
                  <HoverableObjectName object={lang} />
                </div>
                <div>
                  <label>Language Family:</label>
                  {family ? (
                    <HoverableObjectName object={family} />
                  ) : (
                    <Deemphasized>None</Deemphasized>
                  )}
                </div>
                <div>
                  <label>ISO Status:</label>
                  {getLanguageISOStatusLabel(lang.ISO.status) || (
                    <Deemphasized>Unknown</Deemphasized>
                  )}
                </div>
                <div>
                  <label>Modality:</label>
                  {getModalityLabel(lang.modality) || <Deemphasized>Unknown</Deemphasized>}
                </div>
                <div>
                  <label>Population:</label>
                  <CountOfPeople count={lang.populationEstimate} />
                </div>
              </ViewCard>
            );
          })}
        </ResponsiveGrid>
      </div>
    </CollapsibleReport>
  );
};

export default LanguagesMissingWritingSystems;
