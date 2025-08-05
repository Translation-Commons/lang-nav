import React from 'react';

import { OptionsDisplay } from '../components/Selector';
import Selector from '../components/Selector';
import { usePageParams } from '../PageParamsContext';
import { ProfileType } from '../Profiles';

const ProfileSelector: React.FC = () => {
  const { profile, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel="Profile"
      selectorDescription="Indicate the profile best describing what you are looking for. This will change the presets."
      options={Object.values(ProfileType)}
      onChange={(profile: ProfileType) => updatePageParams({ profile })}
      selected={profile}
      optionsDisplay={OptionsDisplay.Dropdown}
    />
  );
};

export default ProfileSelector;
