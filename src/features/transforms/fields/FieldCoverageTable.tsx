import React from 'react';

import getEntityMainTableColumns from '@widgets/tables/columns/getEntityMainTableColumns';

import useEntities from '@features/data/context/useEntities';
import Hoverable from '@features/layers/hovercard/Hoverable';
import ZIndex from '@features/layers/ZIndex';
import { EntityType } from '@features/params/PageParamTypes';

import { EntityData } from '@entities/types/DataTypes';

import { toTitleCase } from '@shared/lib/stringUtils';

import TransformEnum from '../TransformEnum';

import Field from './Field';
import FieldCoverageRow from './FieldCoverageRow';
import { getFieldGroupLabel, getFieldGroups, getFieldsInGroup } from './FieldGroup';
import getField from './getField';

const FieldCoverageTable: React.FC = () => {
  const transforms = Object.values(TransformEnum);
  const entTypes = Object.values(EntityType);
  const dataCompletenessByFieldByEntityType = useDataCompletenessByFieldByEntityType();
  const tableColumnCoverage = getTableColumnCoverage();
  const [showColorBars, setShowColorBars] = React.useState(false);

  return (
    <>
      <table style={{ borderCollapse: 'collapse' }}>
        <colgroup>
          <col span={2} />
          <col style={{ borderRight: '2px solid var(--color-button-secondary)' }} />
          <col span={transforms.length - 1} style={{ borderRight: '2px solid transparent' }} />
          <col style={{ borderRight: '2px solid var(--color-button-secondary)' }} />
          <col span={entTypes.length} style={{ borderRight: '2px solid transparent' }} />
        </colgroup>
        <thead
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--color-background)',
            zIndex: ZIndex.TableStickyRow,
          }}
        >
          <tr>
            <th colSpan={3}>Field</th>
            <th colSpan={transforms.length}>Capabilities</th>
            <th colSpan={entTypes.length}>Coverage across all Entities</th>
          </tr>
          <tr>
            <th>Group</th>
            <th>Label</th>
            <th>Icon</th>
            {transforms.map((transform) => {
              if (transform === TransformEnum.Color) {
                return (
                  <th key={transform}>
                    <Hoverable
                      onClick={() => setShowColorBars((prev) => !prev)}
                      hoverContent="Click to toggle colorbar display"
                      style={{ cursor: 'pointer' }}
                    >
                      {toTitleCase(transform)}
                    </Hoverable>
                  </th>
                );
              } else {
                return <th key={transform}>{toTitleCase(transform)}</th>;
              }
            })}
            {entTypes.map((entType) => (
              <th key={entType}>{toTitleCase(entType)}</th>
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
                      fieldIndex === 0
                        ? { borderTop: '2px solid var(--color-button-secondary)' }
                        : {}
                    }
                  >
                    {fieldIndex === 0 && (
                      <th rowSpan={fields.length}>{getFieldGroupLabel(fieldGroup)}</th>
                    )}
                    <FieldCoverageRow
                      field={field}
                      dataCompleteness={dataCompletenessByFieldByEntityType[field]}
                      tableColumnCoverage={tableColumnCoverage[field] || []}
                      showColorBar={showColorBars}
                    />
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      <div>
        Legend:
        <div>
          <sup>a</sup>: Has data but listed as not applicable by{' '}
          <code>isFieldApplicable()</code>{' '}
        </div>
        <div>
          <sup>c</sup>: Not included as a column in the entity table view
        </div>
        <div>
          <sup>u</sup>: Considered uninteresting for comparison within an entity type (e.g.,
          it&apos;s always 1 or it&apos;s the same as another field)
        </div>
      </div>
    </>
  );
};

function useDataCompletenessByFieldByEntityType(): Record<Field, Record<EntityType, number>> {
  const entitiesByType: Record<EntityType, EntityData[]> = {
    // Note: hooks shouldn't be called in loops so they are listed out manually here
    [EntityType.Language]: useEntities(EntityType.Language),
    [EntityType.Locale]: useEntities(EntityType.Locale),
    [EntityType.Territory]: useEntities(EntityType.Territory),
    [EntityType.WritingSystem]: useEntities(EntityType.WritingSystem),
    [EntityType.Census]: useEntities(EntityType.Census),
    [EntityType.Variant]: useEntities(EntityType.Variant),
    [EntityType.Keyboard]: useEntities(EntityType.Keyboard),
    [EntityType.Org]: useEntities(EntityType.Org),
  };
  return Object.values(Field).reduce(
    (acc, field) => {
      acc[field] = Object.values(EntityType).reduce(
        (entityAcc, entType) => {
          const entities = entitiesByType[entType];
          const totalEntities = entities.length;
          const entitiesWithField = entities.filter(
            (entity) => getField(entity, field) !== undefined,
          ).length;
          entityAcc[entType] = totalEntities > 0 ? (entitiesWithField / totalEntities) * 100 : 0;
          return entityAcc;
        },
        {} as Record<EntityType, number>,
      );
      return acc;
    },
    {} as Record<Field, Record<EntityType, number>>,
  );
}

function getTableColumnCoverage(): Record<Field, EntityType[]> {
  return Object.values(EntityType).reduce(
    (acc, entType) => {
      const columns = getEntityMainTableColumns(entType);
      columns.forEach((column) => {
        const field = column.field;
        if (field) {
          if (!acc[field]) acc[field] = [];
          acc[field].push(entType);
        }
      });
      return acc;
    },
    {} as Record<Field, EntityType[]>,
  );
}

export default FieldCoverageTable;
