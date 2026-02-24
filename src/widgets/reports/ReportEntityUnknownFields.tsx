import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import { getSortBysApplicableToObjectType } from '@features/transforms/fields/FieldApplicability';
import getField from '@features/transforms/fields/getField';
import useFilteredObjects from '@features/transforms/filtering/useFilteredObjects';

import { ObjectData } from '@entities/types/DataTypes';

import CollapsibleReport from '@shared/containers/CollapsibleReport';
import CommaSeparated from '@shared/ui/CommaSeparated';
import DecimalNumber from '@shared/ui/DecimalNumber';

const ReportEntityUnknownFields: React.FC = () => {
  const { objectType } = usePageParams();
  const { filteredObjects } = useFilteredObjects({});

  const fields = getSortBysApplicableToObjectType(objectType);

  const countTotal = filteredObjects.length;
  const resultsByField = fields.reduce(
    (acc, field) => {
      const knownCount = filteredObjects.filter((obj) => getField(obj, field) != null).length;
      const examples = filteredObjects.filter((obj) => getField(obj, field) == null).slice(0, 4);
      acc[field] = { knownCount, missingCount: countTotal - knownCount, examples };
      return acc;
    },
    {} as Record<Field, { knownCount: number; missingCount: number; examples: ObjectData[] }>,
  );

  return (
    <CollapsibleReport title="Unknown Fields">
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Known Count (of {countTotal.toLocaleString()})</th>
            <th>Missing Percent</th>
            <th>Examples Missing</th>
          </tr>
        </thead>
        <tbody>
          {fields
            .sort((a, b) => resultsByField[b].missingCount - resultsByField[a].missingCount)
            .map((field) => (
              <tr key={field}>
                <td>{field}</td>
                <td style={{ position: 'relative' }}>
                  <BackgroundProgressBar
                    percentage={(resultsByField[field].knownCount / countTotal) * 100}
                  />
                  {resultsByField[field].knownCount.toLocaleString()}
                </td>

                <td style={{ position: 'relative' }}>
                  <BackgroundProgressBar
                    percentage={(resultsByField[field].missingCount / countTotal) * 100}
                  />
                  {
                    <DecimalNumber
                      num={(resultsByField[field].missingCount * 100) / countTotal}
                      alignFraction={false}
                    />
                  }
                  %
                </td>
                <td>
                  <CommaSeparated>
                    {resultsByField[field].examples.map((example, index) => (
                      <HoverableObjectName key={index} object={example} labelSource="code" />
                    ))}
                  </CommaSeparated>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </CollapsibleReport>
  );
};

const BackgroundProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: -1,
        top: 0,
        left: 0,
        height: '100%',
        width: `${percentage}%`,
        backgroundColor: 'var(--color-button-secondary)',
      }}
    />
  );
};

export default ReportEntityUnknownFields;
