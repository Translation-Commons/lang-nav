import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { CodeColumn, EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import { OrganizationData } from '@entities/org/OrganizationTypes';

import Deemphasized from '@shared/ui/old/Deemphasized';
import ExternalLink from '@shared/ui/old/ExternalLink';

function getOrganizationColumns(): TableColumn<OrganizationData>[] {
  return [
    CodeColumn,
    NameColumn,
    EndonymColumn,
    {
      key: 'Headquarters',
      render: (object) => <HoverableObjectName object={object.headquarters} />,
      exportValue: (object) => object.headquarters?.ID ?? '',
      field: Field.Territory,
    },
    {
      key: 'Parent Organization',
      render: (object) => <HoverableObjectName object={object.parent} />,
      exportValue: (object) => object.parent?.ID ?? '',
      isInitiallyVisible: false,
    },
    {
      key: 'Census Tables',
      render: (object) =>
        object.censuses && object.censuses.length > 0 ? (
          <HoverableEnumeration
            items={object.censuses.map((doc) => (
              <HoverableObjectName key={doc.ID} object={doc} />
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
      render: (object) => object.url && <ExternalLink href={object.url} />,
      exportValue: (object) => object.url ?? '',
      isInitiallyVisible: false,
    },
  ];
}

export default getOrganizationColumns;
