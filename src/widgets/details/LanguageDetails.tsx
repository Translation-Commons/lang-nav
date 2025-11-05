import React from 'react';

import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import usePageParams from '@features/page-params/usePageParams';
import { getSortFunction } from '@features/sorting/sort';
import TreeListRoot from '@features/treelist/TreeListRoot';

import { LanguagePopulationEstimate } from '@entities/language/LanguagePopulationEstimate';
import LanguagePopulationOfDescendents from '@entities/language/LanguagePopulationFromDescendents';
import LanguagePopulationFromLocales from '@entities/language/LanguagePopulationFromLocales';
import { LanguageData } from '@entities/language/LanguageTypes';
import LanguagePluralCategories from '@entities/language/plurals/LanguagePluralCategories';
import LanguagePluralGridButton from '@entities/language/plurals/LanguagePluralGridToggle';
import LanguageDetailsVitalityAndViability from '@entities/language/vitality/LanguageDetailsVitalityAndViability';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageTreeNodes } from '../treelists/LanguageHierarchy';
import { getLocaleTreeNodes } from '../treelists/LocaleHierarchy';

import LanguageCodes from './sections/LanguageCodes';
import LanguageLocation from './sections/LanguageLocation';
import LanguageNames from './sections/LanguageNames';

type Props = {
  lang: LanguageData;
};

const LanguageDetails: React.FC<Props> = ({ lang }) => {
  return (
    <div className="Details">
      <LanguageNames lang={lang} />
      <LanguageCodes lang={lang} />
      <LanguageAttributes lang={lang} />
      <LanguageDetailsVitalityAndViability lang={lang} />
      <LanguageConnections lang={lang} />
      <LanguageLocation lang={lang} />
    </div>
  );
};

const LanguageAttributes: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const {
    populationEstimate,
    modality,
    primaryWritingSystem,
    writingSystems,
    populationFromLocales,
    populationOfDescendents,
  } = lang;

  return (
    <DetailsSection title="Attributes">
      {populationEstimate && (
        <DetailsField title="Population Estimate:">
          <LanguagePopulationEstimate lang={lang} />
        </DetailsField>
      )}
      {populationOfDescendents && (
        <DetailsField title="Population of Descendents:">
          <LanguagePopulationOfDescendents lang={lang} />
        </DetailsField>
      )}
      {populationFromLocales && (
        <DetailsField title="Population from Locales:">
          <LanguagePopulationFromLocales lang={lang} />
        </DetailsField>
      )}
      {modality && <DetailsField title="Modality:">{modality}</DetailsField>}
      {primaryWritingSystem && (
        <DetailsField title="Primary Writing System:">
          <HoverableObjectName object={primaryWritingSystem} />
        </DetailsField>
      )}
      {Object.values(writingSystems).length > 0 && (
        <DetailsField title="Writing Systems:">
          <CommaSeparated>
            {Object.values(writingSystems)
              .sort(getSortFunction())
              .map((writingSystem) => (
                <HoverableObjectName key={writingSystem.ID} object={writingSystem} />
              ))}
          </CommaSeparated>
        </DetailsField>
      )}
      <DetailsField title="Plural Categories:">
        <div
          style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'start', gap: '0.5em' }}
        >
          <LanguagePluralCategories lang={lang} />
          <LanguagePluralGridButton lang={lang} />
        </div>
      </DetailsField>
    </DetailsSection>
  );
};

const LanguageConnections: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { languageSource } = usePageParams();
  const sortFunction = getSortFunction();
  const {
    childLanguages,
    sourceSpecific: { ISO, Glottolog },
    variantTags,
  } = lang;

  return (
    <DetailsSection title="Connections">
      {ISO.parentLanguage && (
        <DetailsField title="ISO group:">
          <HoverableObjectName object={ISO.parentLanguage} />
        </DetailsField>
      )}
      {Glottolog.parentLanguage && (
        <DetailsField title="Glottolog group:">
          <HoverableObjectName object={Glottolog.parentLanguage} />
        </DetailsField>
      )}
      {variantTags && variantTags.length > 0 && (
        <DetailsField title="Variant Tags:">
          <CommaSeparated>
            {variantTags.map((tag) => (
              <HoverableObjectName key={tag.ID} object={tag} />
            ))}
          </CommaSeparated>
        </DetailsField>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <DetailsField title="Descendent Languages:">
          {childLanguages.length > 0 ? (
            <TreeListRoot rootNodes={getLanguageTreeNodes([lang], languageSource, sortFunction)} />
          ) : (
            <div>
              <Deemphasized>No languages come from this language.</Deemphasized>
            </div>
          )}
        </DetailsField>
        <DetailsField title="Locales:">
          {lang.locales.length > 0 ? (
            <TreeListRoot rootNodes={getLocaleTreeNodes([lang], sortFunction)} />
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
