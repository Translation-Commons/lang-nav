import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import { ObjectType } from '@features/params/PageParamTypes';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import BackgroundProgressBar from '@shared/ui/BackgroundProgressBar';

import BaseColorBar from '../coloring/BaseColorBar';
import getColorGradientForField from '../coloring/getColorGradientForField';
import TransformEnum from '../TransformEnum';

import Field from './Field';
import {
  FIELDS_IN_DEVELOPMENT,
  isFieldApplicable,
  UNINTERESTING_FIELD_COMBINATIONS,
} from './FieldApplicability';
import FieldIcon from './FieldIcon';

const FieldCoverageRow: React.FC<{
  field: Field;
  dataCompleteness: Record<ObjectType, number>;
  tableColumnCoverage: ObjectType[];
  showColorBar: boolean;
}> = ({ field, dataCompleteness, tableColumnCoverage, showColorBar }) => {
  return (
    <>
      <td>
        {FIELDS_IN_DEVELOPMENT.includes(field) ? (
          <Hoverable hoverContent="This field is still in development.">{field}</Hoverable>
        ) : (
          field
        )}
      </td>
      <td>
        <FieldIcon field={field} />
      </td>
      {Object.values(TransformEnum).map((transform) => {
        const hasField = isFieldApplicable(field, transform);
        if (transform === TransformEnum.Color && showColorBar) {
          return <FieldColorBar key={transform} field={field} hasField={hasField} />;
        }
        return (
          <td key={transform} style={{ textAlign: 'center' }}>
            {hasField ? '✓' : ''}
          </td>
        );
      })}
      {Object.values(ObjectType).map((entityType) => (
        <FieldEntityCoverageCell
          key={entityType}
          field={field}
          entityType={entityType}
          dataCompleteness={dataCompleteness[entityType]}
          hasColumn={tableColumnCoverage.includes(entityType)}
        />
      ))}
    </>
  );
};

const FieldEntityCoverageCell: React.FC<{
  field: Field;
  entityType: ObjectType;
  dataCompleteness: number;
  hasColumn: boolean;
}> = ({ field, entityType, dataCompleteness, hasColumn }) => {
  const isApplicable = isFieldApplicable(field, undefined, entityType);
  const hasData = dataCompleteness > 0;

  const shouldBeApplicable = hasData && !isApplicable;
  const isUninteresting = UNINTERESTING_FIELD_COMBINATIONS[entityType]?.includes(field);
  const missingColumn = (isApplicable || hasData) && !hasColumn;
  return (
    <td key={entityType} style={{ textAlign: 'center' }}>
      <BackgroundProgressBar
        percentage={dataCompleteness}
        backgroundColor={
          (shouldBeApplicable || missingColumn) && !isUninteresting
            ? 'var(--color-text-yellow)'
            : undefined
        }
      >
        <Hoverable
          hoverContent={
            shouldBeApplicable || missingColumn || isUninteresting ? (
              <>
                Issues for {field} on {entityType} entities
                {shouldBeApplicable && (
                  <div>
                    <strong>a</strong>: <code>getField()</code> gets non-null data for this value
                    but it is not considered applicable.
                  </div>
                )}
                {missingColumn && (
                  <div>
                    <strong>c</strong>: <code>{entityType}Table</code> does not supply a column for
                    this field.
                  </div>
                )}
                {isUninteresting && (
                  <div>
                    <strong>u</strong>: This field does not provide meaningful information when
                    comparing within an entity type (e.g., it&apos;s always 1 or it&apos;s the same
                    as another field).
                  </div>
                )}
              </>
            ) : undefined
          }
        >
          {hasData ? numberToSigFigs(dataCompleteness, 2) + '%' : ''}
          {hasData && !isApplicable && !isUninteresting && <sup>a</sup>}
          {missingColumn && !isUninteresting && <sup>c</sup>}
          {(hasData || hasColumn) && isUninteresting && <sup>u</sup>}
        </Hoverable>
      </BackgroundProgressBar>
    </td>
  );
};

const FieldColorBar: React.FC<{ field: Field; hasField: boolean }> = ({ field, hasField }) => {
  return (
    <td style={{ position: 'relative', textAlign: 'center' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--color-primary)',
        }}
      >
        <BaseColorBar colorGradient={getColorGradientForField(field)} />
      </div>
      <span style={{ zIndex: 1, position: 'relative', color: 'black' }}>{hasField ? '✓' : ''}</span>
    </td>
  );
};

export default FieldCoverageRow;
