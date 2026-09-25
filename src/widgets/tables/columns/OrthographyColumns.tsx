import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import { Orthography } from '@entities/orthography/OrthographyTypes';

function getOrthographyColumns(): TableColumn<Orthography>[] {
    return [
        CodeColumn,
        NameColumn,
        {
            key: 'Language',
            render: (ent) => ent.language && <HoverableEntityName ent={ent.language} />,
            field: Field.LanguagePrimary,
            columnGroup: 'Related Objects',
        },
        {
            key: 'Writing System',
            render: (ent) => ent.writingSystem && <HoverableEntityName ent={ent.writingSystem} />,
            field: Field.WritingSystem,
            columnGroup: 'Related Objects',
        },
        {
            key: 'Base Characters',
            render: (ent) => ent.baseCharacters,
            field: Field.Example,
        },
    ];
}

export default getOrthographyColumns;