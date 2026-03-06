import React from 'react';

import { ObjectType } from '@features/params/PageParamTypes';

import { toTitleCase } from '@shared/lib/stringUtils';

import TransformEnum from '../TransformEnum';

import Field from './Field';
import { getApplicableFields } from './FieldApplicability';

const FieldCoverageTable: React.FC = () => {
  const transforms = Object.values(TransformEnum);
  const fieldsByTransform = transforms.reduce(
    (acc, transform) => {
      acc[transform] = getApplicableFields(transform, undefined);
      return acc;
    },
    {} as Record<TransformEnum, Field[]>,
  );
  const entityTypes = Object.values(ObjectType);
  const fieldsByEntityType = entityTypes.reduce(
    (acc, entityType) => {
      acc[entityType] = getApplicableFields(undefined, entityType);
      return acc;
    },
    {} as Record<ObjectType, Field[]>,
  );

  return (
    <table style={{ borderCollapse: 'collapse' }}>
      <colgroup>
        <col style={{ borderRight: '2px solid var(--color-button-secondary)' }} />
        <col span={transforms.length - 1} style={{ borderRight: '2px solid transparent' }} />
        <col style={{ borderRight: '2px solid var(--color-button-secondary)' }} />
        <col span={entityTypes.length} style={{ borderRight: '2px solid transparent' }} />
      </colgroup>
      <thead>
        <tr>
          <th>Field</th>
          <th colSpan={transforms.length}>Capabilities</th>
          <th colSpan={entityTypes.length}>Object Types</th>
        </tr>
        <tr>
          <th></th>
          {transforms.map((transform) => (
            <th key={transform}>{toTitleCase(transform)}</th>
          ))}
          {entityTypes.map((entityType) => (
            <th key={entityType}>{toTitleCase(entityType)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.values(Field).map((field) => (
          <tr key={field}>
            <td>{field}</td>
            {transforms.map((transform) => {
              const hasField = fieldsByTransform[transform].includes(field);
              return (
                <td key={transform} style={{ textAlign: 'center' }}>
                  {hasField ? '✓' : ''}
                </td>
              );
            })}
            {entityTypes.map((entityType) => {
              const hasField = fieldsByEntityType[entityType].includes(field);
              return (
                <td key={entityType} style={{ textAlign: 'center' }}>
                  {hasField ? '✓' : ''}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FieldCoverageTable;
