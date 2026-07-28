import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import DetailsSection from '@shared/containers/DetailsSection';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

const LANGUAGE_RELATIONS_SECTION_ID = 'language-relations';

export const LanguageRelationContextBanner: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const hasChildren = lang.childLanguages.length > 0;
  const isMacrolanguage = lang.scope === LanguageScope.Macrolanguage;

  if (!isMacrolanguage && !hasChildren) return null;

  return (
    <div
      style={{
        marginBottom: '1em',
        border: '1px solid var(--color-button-secondary)',
        borderRadius: '0.5em',
        padding: '0.85em 1em',
        backgroundColor: 'var(--color-background-hover)',
      }}
    >
      <strong>{isMacrolanguage ? 'Macrolanguage context' : 'Language group context'}</strong>
      <div style={{ marginTop: '0.35em' }}>
        This entry represents a macrolanguage or language group. It may contain multiple constituent
        languages or varieties. For some uses, such as speech, a more specific language may be more
        appropriate.
        {hasChildren && (
          <>
            {' '}
            <a href={`#${LANGUAGE_RELATIONS_SECTION_ID}`}>See contained languages.</a>
          </>
        )}
      </div>
    </div>
  );
};

const LanguageRelationsWidget: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { getCLDRLanguage } = useDataContext();
  const sortFunction = getSortFunction();
  const childLanguages = [...lang.childLanguages].sort(sortFunction);
  const dialects = childLanguages.filter((child) => child.scope === LanguageScope.Dialect);
  const containedLanguages = childLanguages.filter(
    (child) => child.scope !== LanguageScope.Dialect,
  );
  const relatedLanguages = (lang.CLDR.languageMatch ?? [])
    .map((match) => ({ match, language: getCLDRLanguage(match.supported) }))
    .filter(
      (entry): entry is { match: (typeof entry)['match']; language: LanguageData } =>
        entry.language != null && entry.language.ID !== lang.ID,
    );

  const hasRelations =
    containedLanguages.length > 0 || dialects.length > 0 || relatedLanguages.length > 0;

  return (
    <div id={LANGUAGE_RELATIONS_SECTION_ID}>
      <DetailsSection title="Related Languages">
        {!hasRelations && (
          <Deemphasized>
            No contained, dialect, or related-language data available yet.
          </Deemphasized>
        )}

        {containedLanguages.length > 0 && (
          <RelationGroup title="Contained Languages">
            {containedLanguages.map((language) => (
              <LanguageRelationCard key={language.ID} language={language} />
            ))}
          </RelationGroup>
        )}

        {dialects.length > 0 && (
          <RelationGroup title="Dialects and Varieties">
            {dialects.map((language) => (
              <LanguageRelationCard key={language.ID} language={language} />
            ))}
          </RelationGroup>
        )}

        {relatedLanguages.length > 0 && (
          <RelationGroup title="Related Languages from CLDR">
            {relatedLanguages.map(({ match, language }) => (
              <CLDRRelationCard
                key={`${match.desired}:${match.supported}:${match.distance}`}
                language={language}
                distance={match.distance}
              />
            ))}
          </RelationGroup>
        )}
      </DetailsSection>
    </div>
  );
};

type RelationGroupProps = {
  title: string;
  children: React.ReactNode;
};

const RelationGroup: React.FC<RelationGroupProps> = ({ title, children }) => {
  return (
    <div style={{ marginTop: '0.85em' }}>
      <h4 style={{ margin: '0 0 0.5em' }}>{title}</h4>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75em',
        }}
      >
        {children}
      </div>
    </div>
  );
};

const LanguageRelationCard: React.FC<{ language: LanguageData }> = ({ language }) => {
  return (
    <RelationCard>
      <div style={{ fontWeight: 'bold' }}>
        <HoverableObjectName object={language} labelSource="name and code" />
      </div>
      <RelationMeta label="Type" value={getLanguageScopeLabel(language.scope) ?? 'Language'} />
      <RelationMeta
        label="Speakers"
        value={<CountOfPeople count={language.populationEstimate} />}
      />
    </RelationCard>
  );
};

const CLDRRelationCard: React.FC<{ language: LanguageData; distance: number }> = ({
  language,
  distance,
}) => {
  return (
    <RelationCard>
      <div style={{ fontWeight: 'bold' }}>
        <HoverableObjectName object={language} labelSource="name and code" />
      </div>
      <RelationMeta label="CLDR distance" value={distance} />
    </RelationCard>
  );
};

const RelationCard: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div
      style={{
        border: '1px solid var(--color-button-secondary)',
        borderRadius: '0.5em',
        padding: '0.75em',
        minHeight: '5.25em',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
};

const RelationMeta: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
  return (
    <div style={{ marginTop: '0.35em', color: 'var(--color-text-secondary)' }}>
      <span>{label}: </span>
      {value}
    </div>
  );
};

export default LanguageRelationsWidget;
