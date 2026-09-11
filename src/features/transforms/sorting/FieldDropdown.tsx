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
import { Separator } from '@shared/ui/separator';

import { getFieldLabel } from '@strings/FieldLabelStrings';

import Field from '../fields/Field';
import { FieldGroup, getFieldGroup, getFieldGroupLabel } from '../fields/FieldGroup';
import { getTransformForPageParam } from '../TransformEnum';

type Props = {
  pageParam: keyof PageParams;
};

const commonFields = [Field.Population, Field.Name, Field.DigitalSupport];

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
          <Button
            className={currentValue === Field.None ? 'text-muted-foreground' : ''}
            variant="outline"
          >
            <div className="truncate text-ellipsis">{getFieldLabel(currentValue, entType)}</div>
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={currentValue}
          onValueChange={(value) => updatePageParams({ [pageParam]: value })}
        >
          {commonFields
            .filter((field) => applicableFields.includes(field))
            .map((field) => (
              <DropdownMenuRadioItem
                className={`cursor-pointer ${
                  field === currentValue ? 'bg-accent font-medium text-accent-foreground' : ''
                }`}
                value={field}
                key={'common-' + field}
              >
                {getFieldLabel(field, entType)}
              </DropdownMenuRadioItem>
            ))}
          <Separator />
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
  const { entType } = usePageParams();

  if (fields.length === 1)
    return (
      <DropdownMenuRadioItem
        className={`cursor-pointer ${
          fields[0] === currentValue ? 'bg-accent font-medium text-accent-foreground' : ''
        }`}
        value={fields[0]}
        key={fields[0]}
      >
        {getFieldLabel(fields[0], entType)}
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
              {getFieldLabel(field, entType)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};

export default FieldDropdown;
