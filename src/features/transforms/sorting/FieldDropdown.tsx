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
  const { updatePageParams, entityType } = params;

  const transform = getTransformForPageParam(pageParam);
  const applicableFields = getApplicableFields(transform, entityType);
  if (pageParam === PageParamKey.secondarySortBy) applicableFields.push(Field.None);
  const groupedFields = groupByArray(applicableFields, (field) => getFieldGroup(field));
  const activeGroup = getFieldGroup(currentValue);

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
            const isActiveGroup = fieldGroup === activeGroup;

            return (
              <DropdownMenuSub key={group}>
                <DropdownMenuSubTrigger
                  className={isActiveGroup ? 'bg-accent font-medium text-accent-foreground' : ''}
                >
                  {getFieldGroupLabel(fieldGroup)}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {fields.map((field) => (
                      <DropdownMenuRadioItem
                        className={`cursor-pointer ${
                          field === currentValue
                            ? 'bg-accent font-medium text-accent-foreground'
                            : ''
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
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FieldDropdown;
