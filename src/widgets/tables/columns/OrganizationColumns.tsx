import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { CodeColumn, EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import { OrganizationData } from '@entities/org/OrganizationTypes';

import Deemphasized from '@shared/ui/Deemphasized';
import ExternalLink from '@shared/ui/ExternalLink';

function getOrganizationColumns(): TableColumn<OrganizationData>[] {
  return [
    CodeColumn,
    NameColumn,
    EndonymColumn,
    {
      key: 'Headquarters',
      render: (ent) => <HoverableObjectName ent={ent.headquarters} />,
      exportValue: (ent) => ent.headquarters?.ID ?? '',
      field: Field.Territory,
    },
    {
      key: 'Parent Organization',
      render: (ent) => <HoverableObjectName ent={ent.parent} />,
      exportValue: (ent) => ent.parent?.ID ?? '',
      isInitiallyVisible: false,
    },
    {
      key: 'Census Tables',
      render: (ent) =>
        ent.censuses && ent.censuses.length > 0 ? (
          <HoverableEnumeration
            items={ent.censuses.map((doc) => (
              <HoverableObjectName key={doc.ID} ent={doc} />
            ))}
            limit={5}
          />
        ) : (
          <Deemphasized>n/a</Deemphasized>
        ),
      field: Field.CountOfCensuses,
    },
    {
      key: 'URL',
      render: (ent) => ent.url && <ExternalLink href={ent.url} />,
      exportValue: (ent) => ent.url ?? '',
      isInitiallyVisible: false,
    },
  ];
}

export default getOrganizationColumns;
