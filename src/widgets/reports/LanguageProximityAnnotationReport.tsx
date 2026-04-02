import { CopyIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';

import { LanguageData } from '@entities/language/LanguageTypes';
import { CLDRLanguageMatchData, LanguageProximityLevel } from '@entities/types/CLDRTypes';

import CollapsibleReport from '@shared/containers/CollapsibleReport';
import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageProximityDisplay } from '@strings/LanguageProximityStrings';

type MatchRow = {
  id: string;
  desiredLanguage: LanguageData;
  desiredCode: string;
  supportedLanguage: LanguageData;
  supportedCode: string;
  match: CLDRLanguageMatchData;
};

enum IncludeCriteria {
  Missing = 'missing annotations',
  Annotated = 'has annotations',
  Any = 'any',
}

const cycleOrder: (LanguageProximityLevel | undefined)[] = [
  undefined,
  LanguageProximityLevel.High,
  LanguageProximityLevel.Medium,
  LanguageProximityLevel.Low,
];

const LanguageProximityAnnotationReport: React.FC = () => {
  const { allLanguoids, getCLDRLanguage } = useDataContext();
  const [includeCriteria, setIncludeCriteria] = useState<IncludeCriteria>(IncludeCriteria.Missing);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [changedRows, setChangedRows] = useState<Record<string, true>>({});

  const rows = useMemo(() => {
    const allRows: MatchRow[] = [];
    allLanguoids.forEach((desiredLanguage) => {
      const desiredCode = desiredLanguage.CLDR.code;
      if (desiredCode == null || desiredLanguage.CLDR.languageMatch == null) return;
      desiredLanguage.CLDR.languageMatch.forEach((match) => {
        const supportedCode = getPrimaryLanguageSubtag(match.supported);
        if (supportedCode == null) return;
        const supportedLanguage = getCLDRLanguage(supportedCode);
        if (supportedLanguage == null) return;
        allRows.push({
          id: desiredCode + '->' + supportedCode,
          desiredLanguage,
          desiredCode,
          supportedLanguage,
          supportedCode,
          match,
        });
      });
    });
    return allRows.sort((a, b) => a.match.distance - b.match.distance || a.id.localeCompare(b.id));
  }, [allLanguoids, getCLDRLanguage]);

  const visibleRows = useMemo(() => {
    return rows.filter((row) => {
      const hasAnnotation =
        row.match.mutualIntelligibility != null || row.match.bilingualism != null;
      if (includeCriteria === IncludeCriteria.Any) return true;
      if (includeCriteria === IncludeCriteria.Annotated) return hasAnnotation;
      return !hasAnnotation;
    });
  }, [rows, includeCriteria, refreshIndex]);

  const setMutualIntelligibility = (row: MatchRow) => {
    row.match.mutualIntelligibility = getNextLevel(row.match.mutualIntelligibility);
    const reverseMatch = row.supportedLanguage.CLDR.languageMatch?.find(
      (candidate) => getPrimaryLanguageSubtag(candidate.supported) === row.desiredCode,
    );
    if (reverseMatch != null) reverseMatch.mutualIntelligibility = row.match.mutualIntelligibility;
    setChangedRows((prev) => ({ ...prev, [row.id]: true }));
    setRefreshIndex((idx) => idx + 1);
  };

  const setBilingualism = (row: MatchRow) => {
    row.match.bilingualism = getNextLevel(row.match.bilingualism);
    setChangedRows((prev) => ({ ...prev, [row.id]: true }));
    setRefreshIndex((idx) => idx + 1);
  };

  const copyAnnotations = () => {
    const text = rows
      .filter((row) => row.match.mutualIntelligibility != null || row.match.bilingualism != null)
      .map((row) =>
        [
          row.desiredCode,
          row.supportedCode,
          row.match.mutualIntelligibility ?? '',
          row.match.bilingualism ?? '',
        ].join('\t'),
      )
      .join('\n');
    navigator.clipboard.writeText(
      'Desired\tSupported\tMutualIntelligibility\tBilingualism\n' + text,
    );
  };

  return (
    <CollapsibleReport title="Language Proximity Annotations">
      CLDR language matching is primarily a locale fallback signal. Use this table to annotate
      separate curated levels for bidirectional mutual intelligibility and directed bilingualism.
      <div style={{ display: 'flex', gap: '0.5em', margin: '0.5em 0', flexWrap: 'wrap' }}>
        <label>
          Filter:
          <select
            style={{ marginLeft: '0.25em' }}
            value={includeCriteria}
            onChange={(e) => setIncludeCriteria(e.target.value as IncludeCriteria)}
          >
            {Object.values(IncludeCriteria).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button onClick={copyAnnotations} style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          <CopyIcon size="1em" />
          Copy annotations ({Object.keys(changedRows).length})
        </button>
      </div>

      <div style={{ maxHeight: '30em', overflow: 'auto', border: '1px solid var(--color-border)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--color-background)', zIndex: 1 }}>
            <tr>
              <th>Desired</th>
              <th>Supported</th>
              <th>Distance</th>
              <th>Direction</th>
              <th>Mutual Intelligibility</th>
              <th>Bilingualism</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id}>
                <td>{row.desiredLanguage.nameDisplay + ' (' + row.desiredCode + ')'}</td>
                <td>{row.supportedLanguage.nameDisplay + ' (' + row.supportedCode + ')'}</td>
                <td>{row.match.distance}</td>
                <td>{row.match.oneway ? 'one-way' : 'both'}</td>
                <td>
                  <button onClick={() => setMutualIntelligibility(row)}>
                    {getLanguageProximityDisplay(row.match.mutualIntelligibility)}
                  </button>
                  {row.match.mutualIntelligibility == null && (
                    <>
                      {' '}
                      <Deemphasized>
                        suggested: {getLanguageProximityDisplay(getSuggestedLevel(row.match.distance))}
                      </Deemphasized>
                    </>
                  )}
                </td>
                <td>
                  <button onClick={() => setBilingualism(row)}>
                    {getLanguageProximityDisplay(row.match.bilingualism)}
                  </button>
                  {row.match.bilingualism == null && (
                    <>
                      {' '}
                      <Deemphasized>
                        suggested: {getLanguageProximityDisplay(getSuggestedLevel(row.match.distance))}
                      </Deemphasized>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CollapsibleReport>
  );
};

function getPrimaryLanguageSubtag(languageTag: string): string | undefined {
  const primarySubtag = languageTag.split(/[_-]/)[0];
  if (primarySubtag == null || !/^[a-z]{2,3}$/i.test(primarySubtag)) return undefined;
  return primarySubtag;
}

function getSuggestedLevel(distance: number): LanguageProximityLevel {
  if (distance <= 5) return LanguageProximityLevel.High;
  if (distance <= 20) return LanguageProximityLevel.Medium;
  return LanguageProximityLevel.Low;
}

function getNextLevel(
  current: LanguageProximityLevel | undefined,
): LanguageProximityLevel | undefined {
  const index = cycleOrder.findIndex((candidate) => candidate === current);
  return cycleOrder[(index + 1) % cycleOrder.length];
}

export default LanguageProximityAnnotationReport;
