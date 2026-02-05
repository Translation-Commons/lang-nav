import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import usePageParams from '@features/params/usePageParams';
import { getScopeFilter } from '@features/transforms/filtering/filter';
import { getSortFunction } from '@features/transforms/sorting/sort';
import TreeListRoot from '@features/treelist/TreeListRoot';

import { LanguageData } from '@entities/language/LanguageTypes';
import LanguageDetailsVitalityAndViability from '@entities/language/vitality/LanguageDetailsVitalityAndViability';

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

type Props = {
  lang: LanguageData;
};

const LanguageDetails: React.FC<Props> = ({ lang }) => {
  return (
    <div className="Details">
      <LanguageNames lang={lang} />
      <LanguageCodes lang={lang} />
      <LanguagePopulationDetails lang={lang} />
      <LanguageAttributes lang={lang} />
      <LanguageDetailsVitalityAndViability lang={lang} />
      <LanguageConnections lang={lang} />
      <LanguageLocation lang={lang} />
    </div>
  );
};

const LanguageConnections: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { languageSource } = usePageParams();
  const sortFunction = getSortFunction();
  const filterByScope = getScopeFilter();
  const { childLanguages, ISO, Glottolog, variantTags } = lang;

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
      {variantTags && variantTags.length > 0 && (
        <DetailsField title="Variant Tags">
          <CommaSeparated>
            {variantTags.map((tag) => (
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
    </DetailsSection>
  );
};

export default LanguageDetails;
