import React from 'react';

import { PageParamKey } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import SelectorLabel from '../../widgets/controls/components/SelectorLabel';
import TextInput from '../../widgets/controls/components/TextInput';

const LimitInput: React.FC = () => {
  const { limit, updatePageParams } = usePageParams();

  return (
    <div className="selector" style={{ display: 'flex', alignItems: 'center' }}>
      <SelectorLabel description="Limit how many results are shown." label="Item Limit" />
      <TextInput
        inputStyle={{ minWidth: '3em' }}
        getSuggestions={async () => [
          { searchString: '8', label: '8' },
          { searchString: '20', label: '20' },
          { searchString: '100', label: '100' },
          { searchString: '200', label: '200' },
          { searchString: '1000', label: '1000' },
          { searchString: '-1', label: '∞' },
          { searchString: '', label: 'default' },
        ]}
        onChange={(limit: string) => updatePageParams({ limit: parseInt(limit) })}
        pageParameter={PageParamKey.limit}
        placeholder="∞"
        value={limit.toString()}
      />
    </div>
  );
};

export default LimitInput;
