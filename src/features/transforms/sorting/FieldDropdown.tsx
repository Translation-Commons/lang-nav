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
import { getFieldGroup, getFieldGroupLabel } from '../fields/FieldGroup';
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
      <DropdownMenuTrigger render={<Button variant="outline">{currentValue}</Button>} />
      <DropdownMenuContent className="z-200">
        {groupedFields.map(([group, fields]) => (
          <DropdownMenuSub key={group}>
            <DropdownMenuSubTrigger className={group === activeGroup ? ' primary ' : ''}>
              {getFieldGroupLabel(group)}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {fields.map((field) => (
                  <DropdownMenuCheckboxItem
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
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FieldDropdown;
