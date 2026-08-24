import React from 'react';

import TableOfAllCensuses from '@widgets/tables/TableOfAllCensuses';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import LocalParamsProvider from '@features/params/LocalParamsProvider';

import { OrganizationData } from '@entities/org/OrganizationTypes';

import ExternalLink from '@shared/ui/ExternalLink';

import DetailsField from './ui/DetailsField';
import DetailsSection from './ui/DetailsSection';

type Props = {
  org: OrganizationData;
};

const OrganizationDetails: React.FC<Props> = ({ org }) => {
  const { codeDisplay, nameDisplay, nameEndonym, headquarters, parent, censuses, url, children } =
    org;

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
      {censuses && censuses.length > 0 && (
        <DetailsSection title="Census Tables">
          <LocalParamsProvider overrides={{ page: 1, limit: 20, searchString: '' }}>
            <TableOfAllCensuses organization={org} />
          </LocalParamsProvider>
        </DetailsSection>
      )}
    </div>
  );
};

export default OrganizationDetails;
