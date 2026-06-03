import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import { LocaleData } from '@entities/locale/LocaleTypes';

const columns: TableColumn<LocaleData>[] = [
  {
    key: 'Literacy',
    render: (object) => object.literacyPercent,
    field: Field.Literacy,
  },
  {
    key: 'Writing System (specified)',
    description: (
      <>
        Some locales specify a writing system, for instance{' '}
        <code>
          zh_<strong>Hant</strong>_TW
        </code>{' '}
        means it specifically refers to Traditional Han characters.
      </>
    ),
    render: (object) => <HoverableObjectName object={object.writingSystem} />,
  },
  {
    key: 'Writing System (inferred)',
    description: (
      <>
        Some locales do not include a writing system but it can usually be inferred based on the
        primary writing system for the language. For instance, <code>zh_CN</code> could be written
        in <code>Hant</code> or <code>Hans</code> writing. Since the primary writing system in China
        is the Simplified characters, it can be inferred to be <code>Hans</code>.
      </>
    ),
    render: (object) => (
      <HoverableObjectName object={object.writingSystem ?? object.language?.primaryWritingSystem} />
    ),
    field: Field.WritingSystem,
  },
  {
    key: 'Population (Writing)',
    description:
      'Coarse estimate, based on the spoken population × overall literacy in country, actual numbers may vary.',
    render: (object) => object.pop.writing.unadjusted,
    field: Field.PopulationWriting,
  },
];

export default columns.map((col) => ({
  ...col,
  isInitiallyVisible: false,
  columnGroup: 'Writing',
}));
