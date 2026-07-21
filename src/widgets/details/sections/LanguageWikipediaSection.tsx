import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';
import { WikipediaStatus } from '@entities/types/DataTypes';
import { getStatusColorClass } from '@entities/ui/ObjectWikipediaInfo';

import DetailsSection from '@shared/containers/DetailsSection';
import DetailsStatBlock from '@shared/containers/DetailsStatBlock';
import DetailsStatContainer from '@shared/containers/DetailsStatContainer';
import CountCompact from '@shared/ui/old/CountCompact';
import ExternalLink from '@shared/ui/old/ExternalLink';
import Pill from '@shared/ui/old/Pill';

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
      <DetailsStatContainer>
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
      </DetailsStatContainer>
    </DetailsSection>
  );
};

export default LanguageWikipediaSection;

const WikipediaSectionTitle: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { wikipedias } = lang;
  const wikipedia = wikipedias && wikipedias.length > 0 ? wikipedias[0] : undefined;
  return (
    <div>
      <div className="flex w-full items-center justify-between">
        <span>Wikipedia</span>
        {wikipedia && (
          <Pill className={getStatusColorClass(wikipedia.status)}>{wikipedia.status}</Pill>
        )}
      </div>
    </div>
  );
};

const NotApplicableDisplay = () => <span className="text-[0.6em] text-muted-foreground">N/A</span>;
