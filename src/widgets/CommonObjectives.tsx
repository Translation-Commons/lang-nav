import React, { useState } from 'react';

import { getNewURL } from '@features/params/getNewURL';
import {
  ObjectType,
  PageParamKey,
  PageParamsOptional,
  View,
} from '@features/params/PageParamTypes';
import { SortBy } from '@features/transforms/sorting/SortTypes';

const CommonObjectives: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', margin: '2em auto', maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '0.5em' }}>Common Objectives</h2>
      <ObjectiveList />
    </div>
  );
};

export const ObjectiveList: React.FC = () => {
  return (
    <div style={{ textAlign: 'left', width: 'fit-content', margin: '0 auto' }}>
      <Objective
        label="Find information about a language."
        inputPlaceholder="Enter a language name"
        inputParam={PageParamKey.searchString}
        urlParams={{ limit: 1 }}
      />
      <Objective
        label="See the languages in a country."
        inputPlaceholder="Enter a country"
        inputParam={PageParamKey.territoryFilter}
        urlParams={{ view: View.Table, objectType: ObjectType.Locale }}
      />
      <Objective label="Explore language families." urlParams={{ view: View.Hierarchy }} />
      <Objective
        label="View a map of endangered languages."
        urlParams={{ view: View.Map, limit: -1, colorBy: SortBy.VitalityEthnologue2013 }}
      />
    </div>
  );
};

type ObjectiveProps = {
  label: string;
  inputPlaceholder?: string;
  inputParam?: keyof PageParamsOptional;
  urlParams: PageParamsOptional;
};

const Objective: React.FC<ObjectiveProps> = ({
  inputPlaceholder,
  inputParam,
  label,
  urlParams,
}) => {
  const [inputText, setInputText] = useState('');
  let params: PageParamsOptional = { ...urlParams };
  if (inputParam) params = { [inputParam]: inputText, ...urlParams };

  return (
    <div style={{ marginBottom: '0.5em' }}>
      {label}
      <form
        style={{ display: 'inline-flex' }}
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = `data${getNewURL(params)}`;
        }}
      >
        {inputParam && (
          <input
            style={{ padding: '0.25em 0.5em', marginLeft: '0.5em' }}
            placeholder={inputPlaceholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        )}
        <GoButton params={params} />
      </form>
    </div>
  );
};

const GoButton: React.FC<{ params: PageParamsOptional }> = ({ params }) => {
  return (
    <a href={`data${getNewURL(params)}`} style={{ marginLeft: '0.5em' }}>
      <button style={{ padding: '0.25em 0.5em' }} type="submit">
        GO
      </button>
    </a>
  );
};

export default CommonObjectives;
