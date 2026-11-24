import { WholeWordIcon } from 'lucide-react';
import React from 'react';

import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import FieldDropdown from '../sorting/FieldDropdown';
import TransformOptionsPopup from '../TransformOptionsPopup';

import Field from './Field';

type Props = {
  /** The icon-only copy among the map's controls, which can show on any page with a map. */
  isMapControl?: boolean;
};

const FieldFocusSelector: React.FC<Props> = ({ isMapControl = false }) => {
  const { view, fieldFocus } = usePageParams();

  // Table view manages columns differently
  if (view === View.Table && !isMapControl) return null;

  return (
    <TransformOptionsPopup
      description={
        view === View.Map || isMapControl
          ? 'Locations will be labeled by this text.'
          : 'This text will be included in the display of the entity.'
      }
      isActive={fieldFocus != Field.None}
      compactLabel={isMapControl ? 'Label locations' : undefined}
      label={
        isMapControl ? (
          <WholeWordIcon />
        ) : (
          <>
            <WholeWordIcon />
            <div
              className={'truncate text-ellipsis' + (fieldFocus === Field.None ? ' hidden' : '')}
            >
              {fieldFocus}
            </div>
          </>
        )
      }
      options={{
        'Field Focus': <FieldDropdown pageParam="fieldFocus" />,
      }}
    />
  );
};

export default FieldFocusSelector;
