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
            <th>Known Count</th>
            <th>Missing Count</th>
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
                  <div
                    style={{
                      position: 'absolute',
                      zIndex: -1,
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${(resultsByField[field].knownCount / countTotal) * 100}%`,
                      backgroundColor: 'var(--color-button-secondary)',
                    }}
                  />
                  {resultsByField[field].knownCount.toLocaleString()}
                </td>

                <td style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      zIndex: -1,
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${(resultsByField[field].missingCount / countTotal) * 100}%`,
                      backgroundColor: 'var(--color-button-secondary)',
                    }}
                  />
                  {resultsByField[field].missingCount.toLocaleString()}
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

export default ReportEntityUnknownFields;
