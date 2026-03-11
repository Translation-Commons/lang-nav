import React from 'react';

import useEntities from '@features/data/context/useEntities';
import { ObjectType } from '@features/params/PageParamTypes';

import { EntityData } from '@entities/types/DataTypes';

import { toTitleCase } from '@shared/lib/stringUtils';

import TransformEnum from '../TransformEnum';

import Field from './Field';
import FieldCoverageRow from './FieldCoverageRow';
import { getFieldGroupLabel, getFieldGroups, getFieldsInGroup } from './FieldGroup';
import getField from './getField';

const FieldCoverageTable: React.FC = () => {
  const transforms = Object.values(TransformEnum);
  const entityTypes = Object.values(ObjectType);
  const dataCompletenessByFieldByEntityType = useDataCompletenessByFieldByEntityType();

  return (
    <table style={{ borderCollapse: 'collapse' }}>
      <colgroup>
        <col span={2} />
        <col style={{ borderRight: '2px solid var(--color-button-secondary)' }} />
        <col span={transforms.length - 1} style={{ borderRight: '2px solid transparent' }} />
        <col style={{ borderRight: '2px solid var(--color-button-secondary)' }} />
        <col span={entityTypes.length} style={{ borderRight: '2px solid transparent' }} />
      </colgroup>
      <thead>
        <tr>
          <th colSpan={3}>Field</th>
          <th colSpan={transforms.length}>Capabilities</th>
          <th colSpan={entityTypes.length}>Coverage across all Entities</th>
        </tr>
        <tr>
          <th>Group</th>
          <th>Label</th>
          <th>Icon</th>
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
            <React.Fragment key={fieldGroup}>
              {fields.map((field, fieldIndex) => (
                <tr
                  key={field}
                  style={
                    fieldIndex === 0 ? { borderTop: '2px solid var(--color-button-secondary)' } : {}
                  }
                >
                  {fieldIndex === 0 && (
                    <th rowSpan={fields.length}>{getFieldGroupLabel(fieldGroup)}</th>
                  )}
                  <FieldCoverageRow
                    field={field}
                    dataCompleteness={dataCompletenessByFieldByEntityType[field]}
                  />
                </tr>
              ))}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

function useDataCompletenessByFieldByEntityType(): Record<Field, Record<ObjectType, number>> {
  const entitiesByType: Record<ObjectType, EntityData[]> = {
    // Note: hooks shouldn't be called in loops so they are listed out manually here
    [ObjectType.Language]: useEntities(ObjectType.Language),
    [ObjectType.Locale]: useEntities(ObjectType.Locale),
    [ObjectType.Territory]: useEntities(ObjectType.Territory),
    [ObjectType.WritingSystem]: useEntities(ObjectType.WritingSystem),
    [ObjectType.Census]: useEntities(ObjectType.Census),
    [ObjectType.VariantTag]: useEntities(ObjectType.VariantTag),
    [ObjectType.Keyboard]: useEntities(ObjectType.Keyboard),
  };
  return Object.values(Field).reduce(
    (acc, field) => {
      acc[field] = Object.values(ObjectType).reduce(
        (entityAcc, entityType) => {
          const entities = entitiesByType[entityType];
          const totalEntities = entities.length;
          const entitiesWithField = entities.filter(
            (entity) => getField(entity, field) !== undefined,
          ).length;
          entityAcc[entityType] = totalEntities > 0 ? (entitiesWithField / totalEntities) * 100 : 0;
          return entityAcc;
        },
        {} as Record<ObjectType, number>,
      );
      return acc;
    },
    {} as Record<Field, Record<ObjectType, number>>,
  );
}

export default FieldCoverageTable;
