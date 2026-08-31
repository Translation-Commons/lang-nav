import React from 'react';

import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { LanguageData, LanguageSource } from '@entities/language/LanguageTypes';
import LanguagePluralCategories from '@entities/language/plurals/LanguagePluralCategories';
import LanguagePluralGridButton from '@entities/language/plurals/LanguagePluralGridToggle';
import LanguageVitalityMeter from '@entities/language/vitality/VitalityMeter';
import { VitalitySource } from '@entities/language/vitality/VitalityTypes';

import { Badge } from '@shared/ui/badge';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

import { getModalityLabel } from '@strings/LanguageModalityStrings';
import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

type Props = { lang: LanguageData };

const LanguageDetailsAttributes: React.FC<Props> = ({ lang }) => {
  const {
    modality,
    primaryWritingSystem,
    writingSystems,
    viabilityConfidence,
    viabilityExplanation,
  } = lang;

  return (
    <DetailsSection startCollapsed={true} title="Attributes">
      <DetailsField title="ISO Status">
        <LanguageVitalityMeter lang={lang} src={VitalitySource.ISO} />
      </DetailsField>
      <DetailsField title="Good language category?">
        {viabilityConfidence} {viabilityExplanation && ' ... '}
        {viabilityExplanation}
      </DetailsField>

      {modality != null && (
        <DetailsField title="Medium of Use">{getModalityLabel(modality)}</DetailsField>
      )}
      {primaryWritingSystem && (
        <DetailsField title="Primary Writing System">
          <HoverableEntityName ent={primaryWritingSystem} />
        </DetailsField>
      )}
      {Object.values(writingSystems).length > 0 && (
        <DetailsField title="Writing Systems">
          <CommaSeparated>
            {Object.values(writingSystems)
              .sort(getSortFunction())
              .map((writingSystem) => (
                <HoverableEntityName key={writingSystem.ID} ent={writingSystem} />
              ))}
          </CommaSeparated>
        </DetailsField>
      )}

      <DetailsField title="Centroid Coordinates">
        {lang.latitude != null && lang.longitude != null ? (
          <>
            {lang.latitude.toFixed(4)}°, {lang.longitude.toFixed(4)}°{' '}
            <HoverCard>
              <HoverCardTrigger>
                <Badge className="cursor-help" variant="secondary">
                  {lang.coordsSource}
                </Badge>
              </HoverCardTrigger>
              <HoverCardContent>
                {lang.coordsSource === LanguageSource.Glottolog && (
                  <>
                    These coordinates represent the &quot;primary&quot; location of the{' '}
                    {getLanguageScopeLabel(lang.scope).toLowerCase()}. This could be the centroid of
                    the area where the language is spoken or a significant location such as a major
                    city for which the language is known.
                  </>
                )}
                {lang.coordsSource === LanguageSource.Combined && (
                  <>
                    These coordinates represent the average location of the constituents of this{' '}
                    {getLanguageScopeLabel(lang.scope).toLowerCase()}.
                  </>
                )}
              </HoverCardContent>
            </HoverCard>
          </>
        ) : (
          <Deemphasized>
            No coordinate data for this {getLanguageScopeLabel(lang.scope).toLowerCase()} available.
          </Deemphasized>
        )}
      </DetailsField>

      <DetailsField title="Plural Categories">
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

export default LanguageDetailsAttributes;
