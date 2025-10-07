import { InfoIcon, TriangleAlertIcon } from 'lucide-react';
import React, { ReactNode } from 'react';

import { getUniqueTerritoriesForLanguage } from '../../controls/sort';
import { useDataContext } from '../../data/DataContext';
import Hoverable from '../../generic/Hoverable';
import HoverableEnumeration from '../../generic/HoverableEnumeration';
import { LanguageData, LanguageField } from '../../types/LanguageTypes';
import { SortBy } from '../../types/PageParamTypes';
import { CLDRCoverageText, ICUSupportStatus } from '../common/CLDRCoverageInfo';
import HoverableObjectName from '../common/HoverableObjectName';
import ObjectWikipediaInfo from '../common/ObjectWikipediaInfo';
import PopulationWarning from '../common/PopulationWarning';
import { CodeColumn, EndonymColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

import LanguageVitalityCell from './LanguageVitalityCell';
import { VitalityMeterType } from './LanguageVitalityComputation';

const LanguageTable: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();
  const endonymColumn = { ...EndonymColumn, isInitiallyVisible: true };
  const codeColumn = {
    ...CodeColumn,
    render: (lang: LanguageData): ReactNode => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {lang.codeDisplay}
        {<MaybeISOWarning lang={lang} />}
      </div>
    ),
  };

  return (
    <ObjectTable<LanguageData>
      objects={languagesInSelectedSource}
      columns={[
        codeColumn,
        {
          key: 'ISO 639-3',
          render: (lang) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {lang.sourceSpecific.ISO.code}
              {<MaybeISOWarning lang={lang} />}
            </div>
          ),
          isInitiallyVisible: false,
          columnGroup: 'Codes',
        },
        {
          key: 'Glottocode',
          render: (lang) => lang.sourceSpecific.Glottolog.code,
          isInitiallyVisible: false,
          columnGroup: 'Codes',
        },
        NameColumn,
        endonymColumn,
        {
          key: 'Scope',
          render: (lang) => lang.scope ?? lang.scope,
          isInitiallyVisible: false,
        },
        {
          key: 'Population',
          label: (
            <>
              Population
              <PopulationWarning />
            </>
          ),
          render: (lang) => lang.populationEstimate,
          isNumeric: true,
          sortParam: SortBy.Population,
          columnGroup: 'Population',
        },
        {
          key: 'Population Attested',
          label: (
            <>
              Population
              <br />
              Attested
              <Hoverable hoverContent="This comes from a citable source (citations still needed).">
                <InfoIcon size="1em" />
              </Hoverable>
            </>
          ),
          render: (lang) => lang.populationCited,
          isNumeric: true,
          isInitiallyVisible: false,
          sortParam: SortBy.PopulationAttested,
          columnGroup: 'Population',
        },
        {
          key: 'Population of Descendents',
          label: (
            <>
              Population of
              <br />
              Descendents
              <PopulationWarning />
            </>
          ),
          render: (lang) => (
            <>
              {(lang.populationOfDescendents ?? 0) > (lang.populationEstimate ?? 0) ? (
                <Hoverable hoverContent="Computed population of descendants exceeds population estimate.">
                  <TriangleAlertIcon style={{ color: 'var(--color-text-yellow)' }} size="1em" />
                </Hoverable>
              ) : null}
              {lang.populationOfDescendents?.toLocaleString()}
            </>
          ),
          isNumeric: true,
          isInitiallyVisible: false,
          sortParam: SortBy.PopulationOfDescendents,
          columnGroup: 'Population',
        },
        {
          key: 'Vitality: Metascore',
          render: (lang) => <LanguageVitalityCell lang={lang} type={VitalityMeterType.Metascore} />,
          columnGroup: 'Vitality',
        },
        {
          key: 'Vitality: ISO',
          render: (lang) => <LanguageVitalityCell lang={lang} type={VitalityMeterType.ISO} />,
          isInitiallyVisible: false,
          columnGroup: 'Vitality',
        },
        {
          key: 'Vitality: Ethnologue 2013',
          render: (lang) => <LanguageVitalityCell lang={lang} type={VitalityMeterType.Eth2013} />,
          isInitiallyVisible: false,
          columnGroup: 'Vitality',
        },
        {
          key: 'Vitality: Ethnologue 2025',
          render: (lang) => <LanguageVitalityCell lang={lang} type={VitalityMeterType.Eth2025} />,
          isInitiallyVisible: false,
          columnGroup: 'Vitality',
        },
        {
          key: 'CLDR Coverage',
          label: 'CLDR Coverage',
          render: (lang) => <CLDRCoverageText object={lang} />,
          isInitiallyVisible: false,
          columnGroup: 'Digital Support',
        },
        {
          key: 'ICU Support',
          label: 'ICU Support',
          render: (lang) => <ICUSupportStatus object={lang} />,
          isInitiallyVisible: false,
          columnGroup: 'Digital Support',
        },
        {
          key: 'Parent Language',
          render: (lang) =>
            lang.parentLanguage && <HoverableObjectName object={lang.parentLanguage} />,
          isInitiallyVisible: false,
        },
        {
          key: 'Dialects',
          render: (lang) => (
            <HoverableEnumeration
              items={lang.childLanguages
                .sort((a, b) => (b.populationCited ?? 0) - (a.populationCited ?? 0))
                .map((lang) => lang.nameDisplay)}
            />
          ),
          isNumeric: true,
          isInitiallyVisible: false,
          sortParam: SortBy.CountOfLanguages,
        },
        {
          key: 'Territories',
          render: (lang) => <HoverableEnumeration items={getUniqueTerritoriesForLanguage(lang)} />,
          isNumeric: true,
          sortParam: SortBy.CountOfTerritories,
        },
        {
          key: 'Wikipedia',
          render: (object) => <ObjectWikipediaInfo object={object} size="compact" />,
          isInitiallyVisible: false,
          columnGroup: 'Digital Support',
        },
      ]}
    />
  );
};

function MaybeISOWarning({ lang }: { lang: LanguageData }): React.ReactNode | null {
  return lang.warnings && lang.warnings[LanguageField.isoCode] ? (
    <Hoverable
      hoverContent={lang.warnings[LanguageField.isoCode]}
      style={{ marginLeft: '0.125em' }}
    >
      <TriangleAlertIcon size="1em" display="block" color="var(--color-text-yellow)" />
    </Hoverable>
  ) : null;
}

export default LanguageTable;
