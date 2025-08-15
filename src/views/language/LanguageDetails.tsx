import { TriangleAlertIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import { usePageParams } from '../../controls/PageParamsContext';
import { getSortFunction } from '../../controls/sort';
import CommaSeparated from '../../generic/CommaSeparated';
import Deemphasized from '../../generic/Deemphasized';
import Hoverable from '../../generic/Hoverable';
import LinkButton from '../../generic/LinkButton';
import { LanguageData, LanguageField } from '../../types/LanguageTypes';
import { CLDRCoverageText, ICUSupportStatus } from '../common/CLDRCoverageInfo';
import DetailsSection from '../common/details/DetailsSection';
import HoverableObjectName from '../common/HoverableObjectName';
import PopulationWarning from '../common/PopulationWarning';
import TreeListRoot from '../common/TreeList/TreeListRoot';
import { getLocaleTreeNodes } from '../locale/LocaleHierarchy';

import { getLanguageTreeNodes } from './LanguageHierarchy';

type Props = {
  lang: LanguageData;
};

const LanguageDetails: React.FC<Props> = ({ lang }) => {
  return (
    <div className="Details">
      <LanguageIdentification lang={lang} />
      <LanguageAttributes lang={lang} />
      <LanguageVitalityAndViability lang={lang} />
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
        <div>
          <label>Other names:</label>
          {otherNames.join(', ')}
        </div>
      )}
      <div>
        <label>Language Code:</label>
        {lang.ID}
      </div>
      <div>
        <label>Glottocode:</label>
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
      </div>
      <div>
        <label>ISO Code:</label>
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
      </div>
      <div>
        <label>CLDR Code:</label>
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
      </div>
      {ISO.code && (
        <div>
          <label>Other external links:</label>
          <LinkButton href={`https://www.ethnologue.com/language/${ISO.code}`}>
            Ethnologue
          </LinkButton>
          <LinkButton href={`https://en.wikipedia.org/wiki/ISO_639:${ISO.code}`}>
            Wikipedia
          </LinkButton>
        </div>
      )}
    </DetailsSection>
  );
};

const LanguageAttributes: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { populationCited, modality, primaryWritingSystem, writingSystems } = lang;

  return (
    <DetailsSection title="Attributes">
      {populationCited && (
        <div>
          <label>
            Population
            <PopulationWarning />:
          </label>
          {populationCited.toLocaleString()}
        </div>
      )}
      {modality && (
        <div>
          <label>Modality:</label>
          {modality}
        </div>
      )}
      {primaryWritingSystem && (
        <div>
          <label>Primary Writing System:</label>
          <HoverableObjectName object={primaryWritingSystem} />
        </div>
      )}
      {Object.values(writingSystems).length > 0 && (
        <div>
          <label>Writing Systems:</label>
          <CommaSeparated>
            {Object.values(writingSystems)
              .sort(getSortFunction())
              .map((writingSystem) => (
                <HoverableObjectName key={writingSystem.ID} object={writingSystem} />
              ))}
          </CommaSeparated>
        </div>
      )}
    </DetailsSection>
  );
};

const LanguageVitalityAndViability: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const {
    vitalityISO,
    vitalityEth2013,
    vitalityEth2025,
    viabilityConfidence,
    viabilityExplanation,
  } = lang;

  return (
    <DetailsSection title="Vitality & Viability">
      {vitalityISO && (
        <div>
          <label>ISO Vitality / Status:</label>
          {vitalityISO}
        </div>
      )}
      {vitalityEth2013 && (
        <div>
          <label>Ethnologue Vitality (2013):</label>
          {vitalityEth2013}
        </div>
      )}
      {vitalityEth2025 && (
        <div>
          <label>Ethnologue Vitality (2025):</label>
          {vitalityEth2025}
        </div>
      )}
      <div>
        <label>Should use in World Atlas:</label>
        {viabilityConfidence} ... {viabilityExplanation}
      </div>
      <div>
        <label>CLDR Coverage:</label>
        <CLDRCoverageText object={lang} />
      </div>
      <div>
        <label>ICU Support:</label>
        <ICUSupportStatus object={lang} />
      </div>
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
        <div>
          <label>ISO group:</label>
          <HoverableObjectName object={ISO.parentLanguage} />
        </div>
      )}
      {Glottolog.parentLanguage && (
        <div>
          <label>Glottolog group:</label>
          <HoverableObjectName object={Glottolog.parentLanguage} />
        </div>
      )}
      {variantTags && variantTags.length > 0 && (
        <div>
          <label>Variant Tags:</label>
          <CommaSeparated>
            {variantTags.map((tag) => (
              <HoverableObjectName key={tag.ID} object={tag} />
            ))}
          </CommaSeparated>
        </div>
      )}
      <div style={{ display: 'flex' }}>
        <div>
          <label>Descendent Languages:</label>
          {childLanguages.length > 0 ? (
            <TreeListRoot rootNodes={getLanguageTreeNodes([lang], languageSource, sortFunction)} />
          ) : (
            <div>
              <Deemphasized>No languages come from this language.</Deemphasized>
            </div>
          )}
        </div>
        <div>
          <label>Locales:</label>
          {lang.locales.length > 0 ? (
            <TreeListRoot rootNodes={getLocaleTreeNodes([lang], sortFunction)} />
          ) : (
            <div>
              <Deemphasized>There are no recorded locales for this language.</Deemphasized>
            </div>
          )}
        </div>
      </div>
    </DetailsSection>
  );
};

export default LanguageDetails;
