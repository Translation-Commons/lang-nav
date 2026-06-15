import { SettingsIcon } from 'lucide-react';
import React from 'react';

import PopupCard from '@features/layers/popupcard/PopupCard';

import Settings from './Settings';

const SettingsButton = (): React.ReactNode => {
  return (
    <PopupCard
      buttonLabel={<SettingsIcon size="1.5em" display="block" />}
      buttonClassName="primary"
      buttonStyle={{ padding: '0.5em' }}
      description="View settings"
      title="View settings"
      body={() => <Settings />}
    />
  );
};

export default SettingsButton;
