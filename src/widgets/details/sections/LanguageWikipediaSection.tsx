import { GlobeIcon } from 'lucide-react';
import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';
import { WikipediaStatus } from '@entities/types/DataTypes';
import { getStatusColor } from '@entities/ui/ObjectWikipediaInfo';

import DetailsSection from '@shared/containers/DetailsSection';
import CountCompact from '@shared/ui/CountCompact';
import Deemphasized from '@shared/ui/Deemphasized';
import Pill from '@shared/ui/Pill';

const NADisplay = () => (
  <span style={{ fontSize: '0.6em', color: 'var(--color-text-secondary)' }}>N/A</span>
);

const LanguageWikipediaSection: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { wikipedia } = lang;
  const isActive = wikipedia?.status === WikipediaStatus.Active;

  const title = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25em' }}>
        {wikipedia ? (
          <a
            href={wikipedia.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25em' }}
          >
            Wikipedia
            <GlobeIcon size="0.85em" />
          </a>
        ) : (
          <>
            Wikipedia <GlobeIcon size="0.85em" />
          </>
        )}
      </span>
      {wikipedia && (
        <Pill style={{ color: getStatusColor(wikipedia.status) }}>{wikipedia.status}</Pill>
      )}
    </div>
  );

  return (
    <DetailsSection title={title}>
      <div
        style={{
          display: 'flex',
          gap: '2em',
          marginTop: 'auto',
          paddingBottom: '0.5em',
          justifyContent: 'center',
        }}
      >
        {/* Articles */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '2em', fontWeight: 700, lineHeight: 1 }}>
            {isActive && wikipedia ? <CountCompact count={wikipedia.articles} /> : <NADisplay />}
          </div>
          <Deemphasized>Articles</Deemphasized>
        </div>
        {/* Active Users */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '2em', fontWeight: 700, lineHeight: 1 }}>
            {isActive && wikipedia ? <CountCompact count={wikipedia.activeUsers} /> : <NADisplay />}
          </div>
          <Deemphasized>Active Users</Deemphasized>
        </div>
      </div>
    </DetailsSection>
  );
};

export default LanguageWikipediaSection;
