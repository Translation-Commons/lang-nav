import React from 'react';

import { ProfileType } from '@features/params/Profiles';
import usePageParams from '@features/params/usePageParams';

import ContextIcon from '@shared/ui/ContextIcon';
import EnumDropdown from '@shared/ui/EnumDropdown';

const ProfileSelector: React.FC = () => {
  const { profile, updatePageParams } = usePageParams();

  return (
    <>
      <div className="text-right">
        Preset{' '}
        <ContextIcon>
          Indicate the profile best describing what you are looking for. This will change default
          choices for some page parameters.
        </ContextIcon>
      </div>
      <EnumDropdown
        options={Object.values(ProfileType)}
        value={profile}
        onChange={(profile) => updatePageParams({ profile })}
      />
    </>
  );
};

export default ProfileSelector;
