import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';
import { WikipediaStatus } from '@entities/types/DataTypes';
import { getStatusColor } from '@entities/ui/ObjectWikipediaInfo';

import DetailsSection from '@shared/containers/DetailsSection';
import CountCompact from '@shared/ui/CountCompact';
import Deemphasized from '@shared/ui/Deemphasized';
import ExternalLink from '@shared/ui/ExternalLink';
import Pill from '@shared/ui/Pill';

const LanguageWikipediaSection: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { wikipedia } = lang;
  const isActive = wikipedia?.status === WikipediaStatus.Active;

  return (
    <DetailsSection title={<WikipediaSectionTitle lang={lang} />}>
      <div
        style={{
          display: 'flex',
          gap: '2em',
          marginTop: 'auto',
          paddingBottom: '0.5em',
          justifyContent: 'center',
        }}
      >
        <StatBlock label="Articles">
          {isActive && wikipedia ? <CountCompact count={wikipedia.articles} /> : <NotApplicableDisplay />}
        </StatBlock>
        <StatBlock label="Active Users">
          {isActive && wikipedia ? <CountCompact count={wikipedia.activeUsers} /> : <NotApplicableDisplay />}
        </StatBlock>
      </div>
    </DetailsSection>
  );
};

export default LanguageWikipediaSection;

const WikipediaSectionTitle: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { wikipedia } = lang;
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {wikipedia ? (
        <ExternalLink href={wikipedia.url}>Wikipedia</ExternalLink>
      ) : (
        <span>Wikipedia</span>
      )}
      {wikipedia && (
        <Pill style={{ color: getStatusColor(wikipedia.status) }}>{wikipedia.status}</Pill>
      )}
    </div>
  );
};

const StatBlock: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ fontSize: '2em', fontWeight: 700, lineHeight: 1 }}>{children}</div>
    <Deemphasized>{label}</Deemphasized>
  </div>
);

const NotApplicableDisplay = () => (
  <span style={{ fontSize: '0.6em', color: 'var(--color-text-secondary)' }}>N/A</span>
);