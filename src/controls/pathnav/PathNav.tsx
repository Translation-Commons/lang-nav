import { SlashIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import ObjectTypeDescription from '../../strings/ObjectTypeDescription';
import { ObjectType, View } from '../../types/PageParamTypes';
import Selector, { OptionsDisplay } from '../components/Selector';
import { usePageParams } from '../PageParamsContext';

import ObjectPath from './ObjectPath';

const PathNav: React.FC = () => {
  return (
    <PathContainer>
      <ObjectTypeSelector />
      <SlashIcon size="1em" />
      <ViewSelector />
      <ObjectPath />
    </PathContainer>
  );
};

const ObjectTypeSelector: React.FC = () => {
  const { objectType, updatePageParams, view } = usePageParams();
  const goToObjectType = useCallback(
    (objectType: ObjectType) => {
      updatePageParams({
        objectID: undefined,
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
      getOptionDescription={(objectType) => <ObjectTypeDescription objectType={objectType} />}
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

export const PathContainer: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '0.5em', flexWrap: 'wrap', ...style }}
    >
      {children}
    </div>
  );
};

export default PathNav;
