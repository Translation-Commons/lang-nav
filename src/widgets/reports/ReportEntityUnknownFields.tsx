import React, { useMemo } from 'react';
import { Link } from 'react-router';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import { getApplicableFields } from '@features/transforms/fields/FieldApplicability';
import getField from '@features/transforms/fields/getField';
import useFilteredObjects from '@features/transforms/filtering/useFilteredObjects';

import { getObjectTypeLabelPlural } from '@entities/lib/getObjectName';
import { ObjectData } from '@entities/types/DataTypes';

import CollapsibleReport from '@shared/containers/CollapsibleReport';
import BackgroundProgressBar from '@shared/ui/BackgroundProgressBar';
import CommaSeparated from '@shared/ui/CommaSeparated';
import DecimalNumber from '@shared/ui/DecimalNumber';

const ReportEntityUnknownFields: React.FC = () => {
  const { objectType } = usePageParams();
  const { filteredObjects } = useFilteredObjects({});

  const fields = getApplicableFields(undefined, objectType).filter((f) => f !== Field.None);

  const countTotal = filteredObjects.length;
  const resultsByField = useMemo(
    () =>
      fields.reduce(
        (acc, field) => {
          const knownCount = filteredObjects.filter((obj) => getField(obj, field) != null).length;
          const examples = filteredObjects
            .filter((obj) => getField(obj, field) == null)
            .slice(0, 4);
          acc[field] = { knownCount, missingCount: countTotal - knownCount, examples };
          return acc;
        },
        {} as Record<Field, { knownCount: number; missingCount: number; examples: ObjectData[] }>,
      ),
    [fields, filteredObjects, countTotal],
  );

  return (
    <CollapsibleReport title="Unknown Fields">
      This report shows which fields have the most missing data for the currently filtered{' '}
      {getObjectTypeLabelPlural(objectType)}. This can help identify gaps in the data and potential
      areas for improvement.
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
                <td>
                  <BackgroundProgressBar
                    percentage={(resultsByField[field].knownCount / countTotal) * 100}
                  >
                    {resultsByField[field].knownCount.toLocaleString()}
                  </BackgroundProgressBar>
                </td>

                <td>
                  <BackgroundProgressBar
                    percentage={(resultsByField[field].missingCount / countTotal) * 100}
                  >
                    <DecimalNumber
                      num={(resultsByField[field].missingCount * 100) / countTotal}
                      alignFraction={false}
                    />
                    %
                  </BackgroundProgressBar>
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
      <HoverableButton style={{ margin: '0.5em' }}>
        <Link to="/data-coverage">Go to full data coverage report</Link>
      </HoverableButton>
    </CollapsibleReport>
  );
};

export default ReportEntityUnknownFields;
