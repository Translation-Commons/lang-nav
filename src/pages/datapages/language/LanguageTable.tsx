import { LanguageData, LanguageField } from '@entities/language/LanguageTypes';
import LanguageVitalityCell from '@entities/language/LanguageVitalityCell';
import { VitalityMeterType } from '@entities/language/LanguageVitalityComputation';
import {
  getObjectLiteracy,
  getUniqueTerritoriesForLanguage,
} from '@entities/lib/getObjectMiscFields';
import { CLDRCoverageText, ICUSupportStatus } from '@entities/ui/CLDRCoverageInfo';
import HoverableObjectName from '@entities/ui/HoverableObjectName';
import ObjectWikipediaInfo from '@entities/ui/ObjectWikipediaInfo';
import { useDataContext } from '@features/data-loading/DataContext';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import ObjectTable from '@features/table/ObjectTable';
import Deemphasized from '@shared/ui/Deemphasized';
import Hoverable from '@shared/ui/Hoverable';
import HoverableEnumeration from '@shared/ui/HoverableEnumeration';
import PopulationWarning from '@widgets/PopulationWarning';
import { InfoIcon, TriangleAlertIcon } from 'lucide-react';
import React, { ReactNode } from 'react';

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
          sortParam: SortBy.VitalityMetascore,
          columnGroup: 'Vitality',
        },
        {
          key: 'Vitality: ISO',
          render: (lang) => <LanguageVitalityCell lang={lang} type={VitalityMeterType.ISO} />,
          sortParam: SortBy.VitalityISO,
          isInitiallyVisible: false,
          columnGroup: 'Vitality',
        },
        {
          key: 'Vitality: Ethnologue 2013',
          render: (lang) => <LanguageVitalityCell lang={lang} type={VitalityMeterType.Eth2013} />,
          sortParam: SortBy.VitalityEthnologue2013,
          isInitiallyVisible: false,
          columnGroup: 'Vitality',
        },
        {
          key: 'Vitality: Ethnologue 2025',
          render: (lang) => <LanguageVitalityCell lang={lang} type={VitalityMeterType.Eth2025} />,
          sortParam: SortBy.VitalityEthnologue2025,
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
          columnGroup: 'Relations',
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
          columnGroup: 'Relations',
        },
        {
          key: 'Territories',
          render: (lang) => (
            <HoverableEnumeration
              items={getUniqueTerritoriesForLanguage(lang).map(
                (territory) => territory.nameDisplay,
              )}
            />
          ),
          isNumeric: true,
          sortParam: SortBy.CountOfTerritories,
          columnGroup: 'Relations',
        },
        {
          key: 'Wikipedia',
          render: (object) => <ObjectWikipediaInfo object={object} size="compact" />,
          isInitiallyVisible: false,
          columnGroup: 'Digital Support',
        },
        {
          key: 'Literacy',
          render: (lang) => {
            const literacy = getObjectLiteracy(lang);
            if (literacy == null) return <Deemphasized>—</Deemphasized>;
            return literacy.toFixed(1);
          },
          isInitiallyVisible: false,
          sortParam: SortBy.Literacy,
          isNumeric: true,
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
