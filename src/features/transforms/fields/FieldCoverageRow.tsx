import React from 'react';

import { ObjectType } from '@features/params/PageParamTypes';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import BackgroundProgressBar from '@shared/ui/BackgroundProgressBar';

import BaseColorBar from '../coloring/BaseColorBar';
import getColorGradientForField from '../coloring/getColorGradientForField';
import TransformEnum from '../TransformEnum';

import Field from './Field';
import { isFieldApplicable } from './FieldApplicability';
import FieldIcon from './FieldIcon';

const FieldCoverageRow: React.FC<{
  field: Field;
  dataCompleteness: Record<ObjectType, number>;
}> = ({ field, dataCompleteness }) => {
  return (
    <>
      <td>{field}</td>
      <td>
        <FieldIcon field={field} />
      </td>
      {Object.values(TransformEnum).map((transform) => {
        const hasField = isFieldApplicable(field, transform);
        if (transform === TransformEnum.Color) {
          return <FieldColorBar key={transform} field={field} hasField={hasField} />;
        }
        return (
          <td key={transform} style={{ textAlign: 'center' }}>
            {hasField ? '✓' : ''}
          </td>
        );
      })}
      {Object.values(ObjectType).map((entityType) => {
        const hasField = isFieldApplicable(field, undefined, entityType);
        return (
          <td key={entityType} style={{ textAlign: 'center' }}>
            <BackgroundProgressBar
              percentage={dataCompleteness[entityType]}
              backgroundColor={!hasField ? 'var(--color-text-red)' : undefined}
            >
              {hasField || dataCompleteness[entityType] > 0
                ? numberToSigFigs(dataCompleteness[entityType], 2) + '%'
                : ''}
            </BackgroundProgressBar>
          </td>
        );
      })}
    </>
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
