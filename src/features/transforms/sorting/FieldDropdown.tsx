import React from 'react';

import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { getApplicableFields } from '@features/transforms/fields/FieldApplicability';

import { groupByArray } from '@shared/lib/setUtils';
import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuPortal,
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
  const { updatePageParams, objectType } = params;

  const transform = getTransformForPageParam(pageParam);
  const applicableFields = getApplicableFields(transform, objectType);
  const groupedFields = groupByArray(applicableFields, (field) => getFieldGroup(field));
  const activeGroup = getFieldGroup(currentValue);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline">
            <div className="truncate text-ellipsis">{currentValue}</div>
          </Button>
        }
      />
      <DropdownMenuContent className="z-200">
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
                    <DropdownMenuCheckboxItem
                      className={
                        field === currentValue ? 'bg-accent font-medium text-accent-foreground' : ''
                      }
                      checked={field === currentValue}
                      key={field}
                      onCheckedChange={() => updatePageParams({ [pageParam]: field })}
                    >
                      {field}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FieldDropdown;
