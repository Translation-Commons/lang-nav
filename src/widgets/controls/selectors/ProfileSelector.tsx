import React from 'react';

import { ProfileType } from '@features/params/Profiles';
import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';

const ProfileSelector: React.FC = () => {
  const { profile, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel="Preset"
      selectorDescription="Indicate the profile best describing what you are looking for. This will change the presets."
      options={Object.values(ProfileType)}
      onChange={(profile: ProfileType) => updatePageParams({ profile })}
      selected={profile}
    />
  );
};

export default ProfileSelector;
