import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import { OrganizationData } from '@entities/org/OrganizationTypes';

import Deemphasized from '@shared/ui/Deemphasized';

function getOrganizationColumns(): TableColumn<OrganizationData>[] {
  return [
    CodeColumn,
    NameColumn,
    {
      key: 'Headquarters',
      render: (object) => <HoverableObjectName object={object.headquarters} />,
      field: Field.Territory,
    },
    {
      key: 'Census Tables',
      render: (object) =>
        object.documents ? (
          <HoverableEnumeration
            items={object.documents.map((doc) => (
              <HoverableObjectName key={doc.ID} object={doc} />
            ))}
            limit={5}
          />
        ) : (
          <Deemphasized>n/a</Deemphasized>
        ),
      field: Field.CountOfCensuses,
    },
  ];
}

export default getOrganizationColumns;
