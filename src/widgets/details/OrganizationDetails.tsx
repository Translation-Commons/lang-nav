import React from 'react';

import TableOfAllCensuses from '@widgets/tables/TableOfAllCensuses';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { OrganizationData } from '@entities/org/OrganizationTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import ExternalLink from '@shared/ui/ExternalLink';

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
            <HoverableObjectName object={headquarters} />
          </DetailsField>
        )}
        {parent && (
          <DetailsField title="Parent">
            <HoverableObjectName object={parent} />
          </DetailsField>
        )}
        {children && children.length > 0 && (
          <DetailsField title="Child Organizations">
            {children.map((child) => (
              <HoverableObjectName key={child.ID} object={child} />
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
          <TableOfAllCensuses organization={org} />
        </DetailsSection>
      )}
    </div>
  );
};

export default OrganizationDetails;
