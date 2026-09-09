import { WholeWordIcon } from 'lucide-react';

import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import FieldDropdown from '../sorting/FieldDropdown';
import TransformOptionsPopup from '../TransformOptionsPopup';

import Field from './Field';

const FieldFocusSelector: React.FC = () => {
  const { view, fieldFocus } = usePageParams();

  // Only applies to the TreeList view for now, but could be expanded to other views in the future
  if (view !== View.Hierarchy && view !== View.Map) return null;

  return (
    <TransformOptionsPopup
      description={
        view === View.Map
          ? 'Locations will be labeled by this text.'
          : 'This text will be included in the display of the entity.'
      }
      isActive={fieldFocus != Field.None}
      label={
        <>
          <WholeWordIcon />
          <div className={'truncate text-ellipsis' + (fieldFocus === Field.None ? ' hidden' : '')}>
            {fieldFocus}
          </div>
        </>
      }
      options={{
        'Field Focus': <FieldDropdown pageParam="fieldFocus" />,
      }}
    />
  );
};

export default FieldFocusSelector;
