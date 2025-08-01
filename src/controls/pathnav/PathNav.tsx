import { SlashIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import { ObjectType, View } from '../../types/PageParamTypes';
import Selector, { OptionsDisplay } from '../components/Selector';
import { usePageParams } from '../PageParamsContext';

const PathNav: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', flexWrap: 'wrap' }}>
      <ObjectTypeSelector />
      <SlashIcon size="1em" />
      <ViewSelector />
    </div>
  );
};

const ObjectTypeSelector: React.FC = () => {
  const { objectType, updatePageParams, view } = usePageParams();
  const goToObjectType = useCallback(
    (objectType: ObjectType) => {
      updatePageParams({
        objectType,
        view,
        searchString: undefined,
        page: 1,
      });
    },
    [updatePageParams, view],
  );

  return (
    <Selector
      optionsDisplay={OptionsDisplay.InlineDropdown}
      options={Object.values(ObjectType)}
      onChange={goToObjectType}
      selected={objectType}
    />
  );
};

const ViewSelector: React.FC = () => {
  const { view, updatePageParams } = usePageParams();

  return (
    <Selector
      optionsDisplay={OptionsDisplay.InlineDropdown}
      options={Object.values(View)}
      onChange={(view: View) => updatePageParams({ view, objectID: undefined })}
      selected={view}
    />
  );
};

export default PathNav;
