import React, { useMemo } from 'react';

import Selector from '@widgets/controls/components/Selector';
import { SelectorDisplay } from '@widgets/controls/components/SelectorDisplay';

import usePageParams from '@features/page-params/usePageParams';

const LIMIT_OPTIONS: { [key: string]: number | undefined } = {
  '1': 1,
  '8': 8,
  '12': 12,
  '20': 20,
  '100': 100,
  '200': 200,
  '1000': 1000,
  '∞': -1,
};

/**
 * This component allows the user to change the limit to how many items are visible at the page at once.
 *
 * It does not use the TextInput selector because while that works for freeform content,
 * converting between integers and strings causes some problems. Particularly, since TextInput can
 * update from the URL with useEffect, it causes a recursion loop since the limit is converted to a
 * technically new string every time its converted from a number.
 */
const LimitSelector: React.FC = () => {
  const { limit, updatePageParams } = usePageParams();
  const [customInput, setCustomInput] = React.useState<string | undefined>(undefined);

  const selectedFromPresent = useMemo(
    () => Object.entries(LIMIT_OPTIONS).find((opt) => opt[1] === limit)?.[0],
    [limit],
  );

  return (
    <>
      <Selector<string>
        // selectorLabel="Page item limit"
        options={Object.keys(LIMIT_OPTIONS)}
        onChange={(limitStr: string) => updatePageParams({ limit: LIMIT_OPTIONS[limitStr] })}
        selected={selectedFromPresent || 'custom'}
        display={SelectorDisplay.ButtonList}
        selectorStyle={{ maxWidth: 200 }}
      />
      or pick it manually
      <div
        style={{
          border: '2px solid var(--color-button-secondary)',
          display: 'flex',
          justifyContent: 'left',
          width: 'fit-content',
          borderRadius: '1em',
          gap: '0.5em',
        }}
      >
        <input
          type="number"
          value={customInput ?? (limit === -1 ? '' : limit)}
          onChange={(e) => setCustomInput(e.target.value)}
          style={{
            width: '4em',
            border: 'none',
            lineHeight: '1.5em',
            background: 'none',
            marginLeft: '0.25em',
          }}
          placeholder="∞"
        />
        {/* Manual click because otherwise converting between a string and int causes an infinite loop  because of how useEffect*/}
        <button
          onClick={() => updatePageParams({ limit: parseInt(customInput || '') })}
          className={!selectedFromPresent ? 'primary' : undefined}
        >
          Set Limit
        </button>
      </div>
    </>
  );
};

export default LimitSelector;
