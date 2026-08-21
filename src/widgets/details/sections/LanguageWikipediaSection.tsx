import React from 'react';

import DetailsSection from '@widgets/details/ui/DetailsSection';
import DetailsStatBlock from '@widgets/details/ui/DetailsStatBlock';

import { WikipediaStatus } from '@entities/language/digitalsupport/DigitalSupportTypes';
import { LanguageData } from '@entities/language/LanguageTypes';
import { getStatusColor } from '@entities/ui/ObjectWikipediaInfo';

import { Badge } from '@shared/ui/badge';
import CountCompact from '@shared/ui/CountCompact';
import ExternalLink from '@shared/ui/ExternalLink';

const LanguageWikipediaSection: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { wikipedias } = lang;
  const wikipedia = wikipedias && wikipedias.length > 0 ? wikipedias[0] : undefined;
  const isActive = wikipedia && wikipedia.status === WikipediaStatus.Active;

  return (
    <DetailsSection title={<WikipediaSectionTitle lang={lang} />}>
      <div>
        {wikipedia?.url && (
          <ExternalLink href={'http://' + wikipedia.url}>{wikipedia.url}</ExternalLink>
        )}
      </div>
      <div className="DetailsStatContainer">
        <DetailsStatBlock label="Articles">
          {isActive && wikipedia ? (
            <CountCompact count={wikipedia.articles} />
          ) : (
            <NotApplicableDisplay />
          )}
        </DetailsStatBlock>
        <DetailsStatBlock label="Active Users">
          {isActive && wikipedia ? (
            <CountCompact count={wikipedia.activeUsers} />
          ) : (
            <NotApplicableDisplay />
          )}
        </DetailsStatBlock>
      </div>
    </DetailsSection>
  );
};

export default LanguageWikipediaSection;

const WikipediaSectionTitle: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { wikipedias } = lang;
  const wikipedia = wikipedias && wikipedias.length > 0 ? wikipedias[0] : undefined;
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <span>Wikipedia</span>
        {wikipedia && (
          <Badge variant="secondary" style={{ color: getStatusColor(wikipedia.status) }}>
            {wikipedia.status}
          </Badge>
        )}
      </div>
    </div>
  );
};

const NotApplicableDisplay = () => (
  <span style={{ fontSize: '0.6em', color: 'var(--color-text-secondary)' }}>N/A</span>
);
