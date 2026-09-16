import { Key, useCallback } from 'react';

import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { Button } from '@shared/ui/button';

type Props<T> = {
  options: T[];
  paramKey: keyof PageParams;
  getLabel?: (option: T) => string;
};

const EnumButtons = <T extends Key>({ options, paramKey, getLabel }: Props<T>) => {
  const { [paramKey]: paramValue, updatePageParams } = usePageParams();

  const click = useCallback(
    (option: T) => {
      updatePageParams({ [paramKey]: option });
    },
    [paramValue, paramKey, updatePageParams],
  );

  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <Button
          key={o}
          onClick={() => click(o)}
          variant={paramValue === o ? 'active' : 'outline'}
          role="option"
        >
          {getLabel ? getLabel(o) : String(o)}
        </Button>
      ))}
    </div>
  );
};

export default EnumButtons;
