import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import usePageParams from '@features/params/usePageParams';
import { getScopeFilter } from '@features/transforms/filtering/filter';
import { getSortFunction } from '@features/transforms/sorting/sort';
import TreeListRoot from '@features/treelist/TreeListRoot';

import { LanguageData } from '@entities/language/LanguageTypes';
import LanguageDetailsVitalityAndViability from '@entities/language/vitality/LanguageDetailsVitalityAndViability';
import LanguageVitalitySection from '@entities/language/vitality/LanguageVitalitySection';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageTreeNodes } from '../treelists/LanguageHierarchy';
import { getLocaleTreeNodes } from '../treelists/LocaleHierarchy';

import LanguageAttributes from './sections/LanguageAttributes';
import LanguageCodes from './sections/LanguageCodes';
import LanguageLocation from './sections/LanguageLocation';
import LanguageNames from './sections/LanguageNames';
import LanguagePopulationDetails from './sections/LanguagePopulationDetails';
import LanguageSpeakersByTerritorySection from './sections/LanguageSpeakersByTerritorySection';
import LanguageWikipediaSection from './sections/LanguageWikipediaSection';

type Props = {
  lang: LanguageData;
};

const LanguageDetails: React.FC<Props> = ({ lang }) => {
  return (
    <div className="Details">
      <LanguageNames lang={lang} />
      <LanguageCodes lang={lang} />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1em',
          alignItems: 'stretch',
          marginBottom: '1em',
        }}
      >
        <div style={{ flex: '1 1 200px' }}>
          <LanguagePopulationDetails lang={lang} />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <LanguageWikipediaSection lang={lang} />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <LanguageVitalitySection lang={lang} />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1em',
          alignItems: 'stretch',
          marginBottom: '1em',
        }}
      >
        <div style={{ flex: '2 1 300px' }}>
          <LanguageSpeakersByTerritorySection lang={lang} />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <LanguageDetailsVitalityAndViability lang={lang} />
        </div>
      </div>
      <LanguageAttributes lang={lang} />
      <LanguageConnections lang={lang} />
      <LanguageLocation lang={lang} />
    </div>
  );
};

const LanguageConnections: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { languageSource } = usePageParams();
  const sortFunction = getSortFunction();
  const filterByScope = getScopeFilter();
  const { childLanguages, ISO, Glottolog, variants } = lang;

  return (
    <DetailsSection title="Connections">
      {ISO.parentLanguage && (
        <DetailsField title="ISO group">
          <HoverableObjectName object={ISO.parentLanguage} />
        </DetailsField>
      )}
      {Glottolog.parentLanguage && (
        <DetailsField title="Glottolog group">
          <HoverableObjectName object={Glottolog.parentLanguage} />
        </DetailsField>
      )}
      {variants && variants.length > 0 && (
        <DetailsField title="Variants">
          <CommaSeparated>
            {variants.map((tag) => (
              <HoverableObjectName key={tag.ID} object={tag} />
            ))}
          </CommaSeparated>
        </DetailsField>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <DetailsField title="Descendant Languages">
          {childLanguages.length > 0 ? (
            <TreeListRoot rootNodes={getLanguageTreeNodes([lang], languageSource, sortFunction)} />
          ) : (
            <div>
              <Deemphasized>No languages come from this language.</Deemphasized>
            </div>
          )}
        </DetailsField>
        <DetailsField title="Locales">
          {lang.locales.length > 0 ? (
            <TreeListRoot rootNodes={getLocaleTreeNodes([lang], sortFunction, filterByScope)} />
          ) : (
            <div>
              <Deemphasized>There are no recorded locales for this language.</Deemphasized>
            </div>
          )}
        </DetailsField>
      </div>
      {lang.keyboards && lang.keyboards.length > 0 && (
        <DetailsField title="Keyboards">
          {lang.keyboards && lang.keyboards.length > 0 && (
            <CommaSeparated>
              {lang.keyboards.map((keyboard) => (
                <HoverableObjectName key={keyboard.ID} object={keyboard} />
              ))}
            </CommaSeparated>
          )}
        </DetailsField>
      )}
    </DetailsSection>
  );
};

export default LanguageDetails;
