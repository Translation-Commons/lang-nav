import { Key, useCallback } from 'react';

import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { Button } from '@shared/ui/button';

type Props<T> = {
  options: T[];
  paramKey: keyof PageParams;
  getLabel?: (option: T) => string;
};

const EnumButtonsMultiSelect = <T extends Key>({ options, paramKey, getLabel }: Props<T>) => {
  const { [paramKey]: paramValue, updatePageParams } = usePageParams();

  const toggle = useCallback(
    (option: T) => {
      if ((paramValue as T[]).includes(option)) {
        updatePageParams({
          [paramKey]: (paramValue as T[]).filter((m) => m !== option),
        });
      } else {
        updatePageParams({ [paramKey]: [...(paramValue as T[]), option] });
      }
    },
    [paramValue, paramKey, updatePageParams],
  );

  return (
    <div>
      {options.map((o) => (
        <Button
          key={o}
          onClick={() => toggle(o)}
          variant={(paramValue as T[]).includes(o) ? 'secondary' : 'ghost'}
          role="option"
        >
          {getLabel ? getLabel(o) : String(o)}
        </Button>
      ))}
      <Button
        key="all"
        onClick={() => updatePageParams({ [paramKey]: [] })}
        variant={
          (paramValue as T[]).length === 0 || (paramValue as T[]).length === options.length
            ? 'secondary'
            : 'ghost'
        }
        role="option"
      >
        Any
      </Button>
    </div>
  );
};

export default EnumButtonsMultiSelect;
