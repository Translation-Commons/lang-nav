import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import { KeyboardData } from '@entities/keyboard/KeyboardTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

function getKeyboardColumns(): TableColumn<KeyboardData>[] {
  return [
    { ...CodeColumn, isInitiallyVisible: false },
    NameColumn,
    {
      key: 'Platform',
      render: (object) => object.platform,
      field: Field.Platform,
    },
    {
      key: 'Language(s)',
      render: (object) => (
        <CommaSeparated>
          {(object.languages ?? []).map((lang) => (
            <HoverableObjectName key={lang.ID} object={lang} />
          ))}
        </CommaSeparated>
      ),
      field: Field.Language,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Input Script',
      render: (object) => (
        <HoverableObjectName
          object={object.inputWritingSystem}
          style={
            object.inputScriptCode === object.outputScriptCode
              ? { color: 'var(--color-text)' }
              : undefined
          }
        />
      ),
      field: Field.WritingSystem,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Output Script',
      render: (object) => (
        <HoverableObjectName
          object={object.outputWritingSystem}
          style={
            object.inputScriptCode === object.outputScriptCode
              ? { color: 'var(--color-text)' }
              : undefined
          }
        />
      ),
      field: Field.OutputScript,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Territory',
      render: (object) => <HoverableObjectName object={object.territory} />,
      field: Field.Territory,
      columnGroup: 'Related Objects',
      isInitiallyVisible: false,
    },
    {
      key: 'Variant',
      render: (object) => object.variantCode,
      field: Field.Variant,
      columnGroup: 'Related Objects',
      isInitiallyVisible: false,
    },
  ];
}

export default getKeyboardColumns;
