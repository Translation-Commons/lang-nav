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
      render: (ent) => ent.platform,
      field: Field.Platform,
    },
    {
      key: 'Language(s)',
      render: (ent) => (
        <CommaSeparated>
          {(ent.languages ?? []).map((lang) => (
            <HoverableObjectName key={lang.ID} ent={lang} />
          ))}
        </CommaSeparated>
      ),
      field: Field.Language,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Input Script',
      render: (ent) => (
        <HoverableObjectName
          ent={ent.inputWritingSystem}
          style={
            ent.inputScriptCode === ent.outputScriptCode
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
      render: (ent) => (
        <HoverableObjectName
          ent={ent.outputWritingSystem}
          style={
            ent.inputScriptCode === ent.outputScriptCode
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
      render: (ent) => <HoverableObjectName ent={ent.territory} />,
      field: Field.Territory,
      columnGroup: 'Related Objects',
      isInitiallyVisible: false,
    },
    {
      key: 'Variant',
      render: (ent) => ent.variantCode,
      field: Field.Variant,
      columnGroup: 'Related Objects',
      isInitiallyVisible: false,
    },
  ];
}

export default getKeyboardColumns;
