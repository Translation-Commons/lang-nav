import React from 'react';

import MiniCardList from '@widgets/cardlists/MiniCardList';
import { getViewIcon } from '@widgets/controls/selectors/ViewSelector';
import TableOfAllCensuses from '@widgets/tables/TableOfAllCensuses';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { View } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';

import { OrganizationData } from '@entities/org/OrganizationTypes';

import ExternalLink from '@shared/ui/ExternalLink';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

import DetailsField from './ui/DetailsField';
import DetailsSection from './ui/DetailsSection';

type Props = {
  org: OrganizationData;
};

const OrganizationDetails: React.FC<Props> = ({ org }) => {
  const { codeDisplay, nameDisplay, nameEndonym, headquarters, parent, url, children } = org;

  return (
    <div className="Details">
      <DetailsSection title="Definition">
        <DetailsField title="Short Name">{codeDisplay}</DetailsField>
        <DetailsField title="Full Name">{nameDisplay}</DetailsField>
        {nameEndonym && <DetailsField title="Endonym">{nameEndonym}</DetailsField>}
        {headquarters && (
          <DetailsField title="Headquartered in">
            <HoverableEntityName ent={headquarters} />
          </DetailsField>
        )}
        {parent && (
          <DetailsField title="Parent">
            <HoverableEntityName ent={parent} />
          </DetailsField>
        )}
        {children && children.length > 0 && (
          <DetailsField title="Child Organizations">
            {children.map((child) => (
              <HoverableEntityName key={child.ID} ent={child} />
            ))}
          </DetailsField>
        )}
        {url && (
          <DetailsField title="URL">
            <ExternalLink href={url} />
          </DetailsField>
        )}
      </DetailsSection>
      <OrgCensuses org={org} />
    </div>
  );
};

const OrgCensuses: React.FC<{ org: OrganizationData }> = ({ org }) => {
  const { censuses } = org;
  const [sectionView, setSectionView] = React.useState(View.CardList);

  if (!censuses || censuses.length === 0) return null;
  return (
    <DetailsSection
      title="Census Tables"
      score={censuses.length}
      headerOptions={
        <Tabs value={sectionView} onValueChange={setSectionView}>
          <TabsList>
            {[View.CardList, View.Table].map((v) => (
              <TabsTrigger key={v} value={v} className="cursor-pointer">
                {getViewIcon(v)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
      <LocalParamsProvider
        overrides={{ page: 1, limit: 20, searchString: '', sortBy: Field.CountOfLanguages }}
      >
        {sectionView === View.CardList && <MiniCardList ents={censuses} />}
        {sectionView === View.Table && <TableOfAllCensuses organization={org} />}
      </LocalParamsProvider>
    </DetailsSection>
  );
};

export default OrganizationDetails;
