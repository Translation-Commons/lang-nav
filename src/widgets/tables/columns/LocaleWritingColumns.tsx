import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import TableColumn from '@features/table/TableColumn';
import TableValueType from '@features/table/TableValueType';
import Field from '@features/transforms/fields/Field';

import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import LocalePopulationAdjusted from '@entities/locale/LocalePopulationAdjusted';
import { LocaleData } from '@entities/locale/LocaleTypes';
import PopulationFocus from '@entities/types/PopulationFocus';

const columns: TableColumn<LocaleData>[] = [
  {
    key: 'Literacy',
    render: (ent) => ent.literacyPercent,
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
    render: (ent) => <HoverableEntityName ent={ent.writingSystem} />,
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
    render: (ent) => (
      <HoverableEntityName ent={ent.writingSystem ?? ent.language?.primaryWritingSystem} />
    ),
    field: Field.WritingSystem,
  },
  {
    key: 'Population (Writing)',
    description:
      'Some of these are based on censuses with precise data about writing, but most are computed from spoken language usage estimates and converted to writing usage based on literacy rate and spoken traditions.',
    render: (ent) => <LocalePopulationAdjusted locale={ent} focus={PopulationFocus.Writing} />,
    exportValue: (ent) => ent.pop.writing.adjusted,
    field: Field.PopulationWriting,
    isInitiallyVisible: (params) => params.populationFocus !== PopulationFocus.Speaking,
  },
  {
    key: 'Population (Writing, percent)',
    description:
      'The percent of people in the territory that read and/or write in the language, often computed from other estimates, these should be taken with a grain of salt.',
    render: (ent) => ent.pop.writing.percentAdjusted,
    valueType: TableValueType.Decimal,
    isInitiallyVisible: (params) => params.populationFocus === PopulationFocus.Writing,
  },
  {
    key: 'Population (Writing, source)',
    description:
      'Source for the writing-population estimate. This may come from a writing-specific census record, or be derived from broader usage estimates and adjusted using literacy rate and modality discounts.',
    render: (ent) => <LocaleCensusCitation locale={ent} focus={PopulationFocus.Writing} />,
    isInitiallyVisible: (params) => params.populationFocus !== PopulationFocus.Speaking,
  },
];

export default columns.map((col) => ({
  ...col,
  isInitiallyVisible: col.isInitiallyVisible ?? false,
  columnGroup: 'Writing',
}));
