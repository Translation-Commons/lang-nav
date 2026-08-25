import React from 'react';

import { PageParamKey, PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { getApplicableFields } from '@features/transforms/fields/FieldApplicability';

import { groupByArray } from '@shared/lib/setUtils';
import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

import Field from '../fields/Field';
import { FieldGroup, getFieldGroup, getFieldGroupLabel } from '../fields/FieldGroup';
import { getTransformForPageParam } from '../TransformEnum';

type Props = {
  pageParam: keyof PageParams;
};

const FieldDropdown: React.FC<Props> = ({ pageParam }) => {
  const params = usePageParams();
  const currentValue = params[pageParam] as Field;
  const { updatePageParams, entType } = params;

  const transform = getTransformForPageParam(pageParam);
  const applicableFields = getApplicableFields(transform, entType);
  if (pageParam === PageParamKey.secondarySortBy) applicableFields.push(Field.None);
  const groupedFields = groupByArray(applicableFields, (field) => getFieldGroup(field));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="cursor-pointer" variant="outline">
            <div className="truncate text-ellipsis">{currentValue}</div>
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={currentValue}
          onValueChange={(value) => updatePageParams({ [pageParam]: value })}
        >
          {groupedFields.map(([group, fields]) => {
            const fieldGroup = Number(group) as FieldGroup;

            return (
              <DropdownGroup
                key={group}
                group={fieldGroup}
                fields={fields}
                currentValue={currentValue}
              />
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const DropdownGroup: React.FC<{
  group: FieldGroup;
  fields: Field[];
  currentValue: Field;
}> = ({ group, fields, currentValue }) => {
  const isActiveGroup = group === getFieldGroup(currentValue);

  if (fields.length === 1)
    return (
      <DropdownMenuRadioItem
        className={`cursor-pointer ${
          fields[0] === currentValue ? 'bg-accent font-medium text-accent-foreground' : ''
        }`}
        value={fields[0]}
        key={fields[0]}
      >
        {fields[0]}
      </DropdownMenuRadioItem>
    );

  return (
    <DropdownMenuSub key={group}>
      <DropdownMenuSubTrigger
        className={isActiveGroup ? 'bg-accent font-medium text-accent-foreground' : ''}
      >
        {getFieldGroupLabel(group)}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {fields.map((field) => (
            <DropdownMenuRadioItem
              className={`cursor-pointer ${
                field === currentValue ? 'bg-accent font-medium text-accent-foreground' : ''
              }`}
              value={field}
              key={field}
            >
              {field}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};

export default FieldDropdown;
