import React from 'react';

import usePageParams from '@features/params/usePageParams';

import { InputWithSuggestion } from '@shared/ui/input-with-suggestions';

const LIMITS = [4, 8, 12, 20, 50, 100, 200, 1000, 2000, '∞'];

const LimitInput: React.FC<{ className?: string; showTitle?: boolean }> = ({
  className,
  showTitle = true,
}) => {
  const { limit, updatePageParams } = usePageParams();

  return (
    <div className={className}>
      {showTitle && 'Item limit: '}
      <InputWithSuggestion
        value={limit < 0 ? '∞' : limit.toString()}
        setValue={(value) => updatePageParams({ limit: parseInt(value) || -1 })}
        suggestions={LIMITS.map(String)}
        placeholder="∞"
      />
    </div>
  );
};

export default LimitInput;
