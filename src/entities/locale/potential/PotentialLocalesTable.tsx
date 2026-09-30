import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';
import Field from '@features/transforms/fields/Field';

import PopulationFocus from '@entities/types/PopulationFocus';

import CopyButton from '@shared/ui/CopyButton';

import LocaleCensusCitation from '../LocaleCensusCitation';
import { LocaleData } from '../LocaleTypes';

import getLocaleExportString from './getLocaleExportString';

const PotentialLocalesTable: React.FC<{
  locales: LocaleData[];
  showRelatedLocales?: boolean;
}> = ({ locales }) => {
  return (
    <InteractiveEntityTable<LocaleData>
      tableID={TableID.PotentialLocales}
      ents={locales}
      columns={[
        {
          key: 'Potential Locale',
          render: (ent) => <HoverableEntityName ent={ent} labelSource="code" />,
          field: Field.Code,
        },
        {
          key: 'Language',
          render: (ent) =>
            ent.language ? <HoverableEntityName ent={ent.language} /> : ent.languageCode,
          field: Field.Name,
        },
        {
          key: 'Population (Adjusted)',
          render: (ent) => ent.pop.speaking.adjusted, // All pop numbers are saved in the "speaking" field for potential locales
          field: Field.Population,
        },
        {
          key: 'Population (in Census)',
          render: (ent) => ent.pop.speaking.unadjusted,
          field: Field.PopulationDirectlySourced,
          isInitiallyVisible: false,
        },
        {
          key: '% in Territory',
          render: (ent) => ent.pop.speaking.percent,
          field: Field.PercentOfTerritoryPopulation,
        },
        {
          key: '% of Global Language Speakers',
          render: (ent) =>
            ent.pop.speaking.adjusted &&
            (ent.pop.speaking.adjusted * 100) / (ent.language?.pop.overall ?? 1),
          field: Field.PercentOfOverallLanguageSpeakers,
        },
        {
          key: 'Population Source',
          render: (ent) => <LocaleCensusCitation locale={ent} focus={PopulationFocus.Speaking} />,
        },
        {
          key: 'Related Locale',
          render: (ent) => (
            <HoverableEntityName ent={ent.relatedLocales?.childLanguages?.[0]} labelSource="code" />
          ),
        },
        {
          key: 'Copy',
          render: (ent) => (
            <CopyButton getTextToCopy={() => getLocaleExportString(ent)}>Copy</CopyButton>
          ),
        },
      ]}
    />
  );
};

export default PotentialLocalesTable;
