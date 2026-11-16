import React from 'react';

import { LocaleSeparator } from '@features/params/LocalStorageParams';
import usePageParams from '@features/params/usePageParams';

import ContextIcon from '@shared/ui/ContextIcon';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

const LocaleSeparatorSelector: React.FC = () => {
  const { setLocaleSeparator, localeSeparator } = usePageParams();

  return (
    <>
      <div className="text-right">
        Locale Separator{' '}
        <ContextIcon>
          Choose how locale codes are separated, for example using a hyphen (&quot;ar-EG&quot;) or
          an underscore (&quot;ar_EG&quot;). This setting affects how locale codes are displayed
          throughout the application. This setting is stored locally and will persist across
          sessions.
        </ContextIcon>
      </div>
      <Tabs value={localeSeparator} onValueChange={setLocaleSeparator}>
        <TabsList>
          <TabsTrigger value={LocaleSeparator.Hyphen} className="cursor-pointer">
            {LocaleSeparator.Hyphen}
          </TabsTrigger>
          <TabsTrigger value={LocaleSeparator.Underscore} className="cursor-pointer">
            {LocaleSeparator.Underscore}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
};

export default LocaleSeparatorSelector;
