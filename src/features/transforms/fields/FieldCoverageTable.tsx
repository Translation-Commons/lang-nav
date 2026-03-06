import React, { useMemo } from 'react';

import useEntities from '@features/data/context/useEntities';
import { ObjectType } from '@features/params/PageParamTypes';

import { ObjectData } from '@entities/types/DataTypes';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import { toTitleCase } from '@shared/lib/stringUtils';
import BackgroundProgressBar from '@shared/ui/BackgroundProgressBar';

import TransformEnum from '../TransformEnum';

import Field from './Field';
import { getApplicableFields } from './FieldApplicability';
import { getFieldGroup, getFieldGroupLabel, getFieldGroups, getFieldsInGroup } from './FieldGroup';
import getField from './getField';

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

  const entitiesByType: Record<ObjectType, ObjectData[]> = {
    // Note: hooks shouldn't be called in loops so they are listed out manually here
    [ObjectType.Language]: useEntities(ObjectType.Language),
    [ObjectType.Locale]: useEntities(ObjectType.Locale),
    [ObjectType.Territory]: useEntities(ObjectType.Territory),
    [ObjectType.WritingSystem]: useEntities(ObjectType.WritingSystem),
    [ObjectType.Census]: useEntities(ObjectType.Census),
    [ObjectType.VariantTag]: useEntities(ObjectType.VariantTag),
    [ObjectType.Keyboard]: useEntities(ObjectType.Keyboard),
  };
  const dataCompletenessByFieldByEntityType: Record<Field, Record<ObjectType, number>> = useMemo(
    () =>
      Object.values(Field).reduce(
        (acc, field) => {
          acc[field] = Object.values(ObjectType).reduce(
            (entityAcc, entityType) => {
              const entities = entitiesByType[entityType] as ObjectData[];
              const totalEntities = entities.length;
              const entitiesWithField = entities.filter(
                (entity) => getField(entity, field) !== undefined,
              ).length;
              entityAcc[entityType] =
                totalEntities > 0 ? (entitiesWithField / totalEntities) * 100 : 0;
              return entityAcc;
            },
            {} as Record<ObjectType, number>,
          );
          return acc;
        },
        {} as Record<Field, Record<ObjectType, number>>,
      ),
    [entitiesByType],
  );

  return (
    <table style={{ borderCollapse: 'collapse' }}>
      <colgroup>
        <col />
        <col style={{ borderRight: '2px solid var(--color-button-secondary)' }} />
        <col span={transforms.length - 1} style={{ borderRight: '2px solid transparent' }} />
        <col style={{ borderRight: '2px solid var(--color-button-secondary)' }} />
        <col span={entityTypes.length} style={{ borderRight: '2px solid transparent' }} />
      </colgroup>
      <thead>
        <tr>
          <th colSpan={2}>Field</th>
          <th colSpan={transforms.length}>Capabilities</th>
          <th colSpan={entityTypes.length}>Coverage across all Entities</th>
        </tr>
        <tr>
          <th>Group</th>
          <th>Label</th>
          {transforms.map((transform) => (
            <th key={transform}>{toTitleCase(transform)}</th>
          ))}
          {entityTypes.map((entityType) => (
            <th key={entityType}>{toTitleCase(entityType)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {getFieldGroups().map((fieldGroup) => {
          const fields = getFieldsInGroup(fieldGroup);
          return (
            <>
              {fields.map((field, fieldIndex) => (
                <tr
                  key={field}
                  style={
                    fieldIndex === 0 ? { borderTop: '2px solid var(--color-button-secondary)' } : {}
                  }
                >
                  {fieldIndex === 0 && (
                    <th rowSpan={fields.length}>{getFieldGroupLabel(getFieldGroup(field))}</th>
                  )}
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
                        <BackgroundProgressBar
                          percentage={dataCompletenessByFieldByEntityType[field][entityType]}
                          backgroundColor={!hasField ? 'var(--color-text-red)' : undefined}
                        >
                          {hasField || dataCompletenessByFieldByEntityType[field][entityType] > 0
                            ? numberToSigFigs(
                                dataCompletenessByFieldByEntityType[field][entityType],
                                2,
                              ) + '%'
                            : ''}
                        </BackgroundProgressBar>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </>
          );
        })}
      </tbody>
    </table>
  );
};

export default FieldCoverageTable;
