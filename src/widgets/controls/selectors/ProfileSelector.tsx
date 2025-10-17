import React from 'react';

import { ProfileType } from '@features/page-params/Profiles';
import { usePageParams } from '@features/page-params/usePageParams';

import Selector from '../components/Selector';
import { SelectorDisplay } from '../components/SelectorDisplay';

const ProfileSelector: React.FC = () => {
  const { profile, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel="Preset"
      selectorDescription="Indicate the profile best describing what you are looking for. This will change the presets."
      options={Object.values(ProfileType)}
      onChange={(profile: ProfileType) => updatePageParams({ profile })}
      selected={profile}
      display={SelectorDisplay.Dropdown}
    />
  );
};

export default ProfileSelector;
