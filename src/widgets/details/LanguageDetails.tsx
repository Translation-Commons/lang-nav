import { TriangleAlertIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import Hoverable from '@features/hovercard/Hoverable';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import usePageParams from '@features/page-params/usePageParams';
import { getSortFunction } from '@features/sorting/sort';
import TreeListRoot from '@features/treelist/TreeListRoot';

import { LanguagePopulationEstimate } from '@entities/language/LanguagePopulationEstimate';
import LanguagePopulationOfDescendents from '@entities/language/LanguagePopulationFromDescendents';
import LanguagePopulationFromLocales from '@entities/language/LanguagePopulationFromLocales';
import { LanguageData, LanguageField } from '@entities/language/LanguageTypes';
import LanguageDetailsVitalityAndViability from '@entities/language/vitality/LanguageDetailsVitalityAndViability';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

import { getLanguageTreeNodes } from '../treelists/LanguageHierarchy';
import { getLocaleTreeNodes } from '../treelists/LocaleHierarchy';

type Props = {
  lang: LanguageData;
};

const LanguageDetails: React.FC<Props> = ({ lang }) => {
  return (
    <div className="Details">
      <LanguageIdentification lang={lang} />
      <LanguageAttributes lang={lang} />
      <LanguageDetailsVitalityAndViability lang={lang} />
      <LanguageConnections lang={lang} />
    </div>
  );
};

const LanguageIdentification: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { codeISO6391, nameDisplay, nameEndonym, sourceSpecific } = lang;
  const { Glottolog, ISO, CLDR } = sourceSpecific;

  // nameDisplay and nameEndonym should already be shown in the title for this
  const otherNames = useMemo(
    () => lang.names.filter((name) => name != nameDisplay && name != nameEndonym, []),
    [nameDisplay, lang.names],
  );

  return (
    <DetailsSection title="Identification">
      {otherNames.length > 0 && (
        <DetailsField title="Other names:">{otherNames.join(', ')}</DetailsField>
      )}
      <DetailsField title="Language Code:">{lang.ID}</DetailsField>
      <DetailsField title="Glottocode:">
        {Glottolog.code ? (
          <>
            {Glottolog.code}
            <LinkButton href={`https://glottolog.org/resource/languoid/id/${Glottolog.code}`}>
              Glottolog
            </LinkButton>
          </>
        ) : (
          <Deemphasized>Not in Glottolog</Deemphasized>
        )}
      </DetailsField>
      <DetailsField title="ISO Code:">
        {ISO.code ? (
          <>
            {ISO.code}
            {codeISO6391 ? ` | ${codeISO6391}` : ''}
            {lang.warnings && lang.warnings[LanguageField.isoCode] && (
              <Hoverable
                hoverContent={lang.warnings[LanguageField.isoCode]}
                style={{ marginLeft: '0.125em' }}
              >
                <TriangleAlertIcon size="1em" color="var(--color-text-yellow)" />
              </Hoverable>
            )}
            <LinkButton href={`https://iso639-3.sil.org/code/${ISO.code}`}>ISO Catalog</LinkButton>
          </>
        ) : (
          <Deemphasized>Not in ISO catalog</Deemphasized>
        )}
      </DetailsField>
      <DetailsField title="CLDR Code:">
        {CLDR.code ? (
          <>
            {CLDR.code}
            <LinkButton
              href={`https://github.com/unicode-org/cldr/blob/main/common/main/${CLDR.code}.xml`}
            >
              CLDR XML
            </LinkButton>
          </>
        ) : (
          <Deemphasized>Not in CLDR</Deemphasized>
        )}
      </DetailsField>
      {ISO.code && (
        <DetailsField title="Other external links:">
          <LinkButton href={`https://www.ethnologue.com/language/${ISO.code}`}>
            Ethnologue
          </LinkButton>
          <LinkButton href={`https://en.wikipedia.org/wiki/ISO_639:${ISO.code}`}>
            Wikipedia
          </LinkButton>
        </DetailsField>
      )}
    </DetailsSection>
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
