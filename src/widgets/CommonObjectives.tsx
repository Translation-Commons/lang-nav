import React, { useState } from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import { getNewURL } from '@features/params/getNewURL';
import { ObjectType, PageParamKey, PageParams, View } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';

import './CommonObjectives.css';

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
    <div className="ObjectiveGrid">
      <Objective
        label="Find information about a language."
        inputPlaceholder="Enter a language name"
        inputParam={PageParamKey.searchString}
        urlPath={LangNavPageName.Lucky}
      />
      <Objective
        label="See the languages in a country."
        inputPlaceholder="Enter a country"
        inputParam={PageParamKey.territoryFilter}
        urlParams={{ view: View.Table, objectType: ObjectType.Locale }}
      />
      <Objective label="Explore language families." urlParams={{ view: View.Hierarchy }} />
      <Objective
        label="View a map of languages by population."
        urlParams={{ view: View.Map, limit: -1, colorBy: Field.Population }}
      />
    </div>
  );
};

type ObjectiveProps = {
  label: string;
  inputPlaceholder?: string;
  inputParam?: keyof PageParams;
  urlParams?: Partial<PageParams>;
  urlPath?: LangNavPageName;
};

// Renders 2 top-level nodes (label span + form) directly into the parent's
// grid: the form uses `display: contents` so it doesn't create its own box,
// letting its own children (input-or-spacer, GoButton) land in the grid's
// 2nd/3rd columns. This keeps every row's controls aligned regardless of
// label length, while the form still fully works for submit/Enter-to-submit.
const Objective: React.FC<ObjectiveProps> = ({
  inputPlaceholder,
  inputParam,
  label,
  urlParams = {},
  urlPath = LangNavPageName.Data,
}) => {
  const [inputText, setInputText] = useState('');
  let params: Partial<PageParams> = { ...urlParams };
  if (inputParam) params = { [inputParam]: inputText, ...urlParams };

  return (
    <>
      <span>{label}</span>
      <form
        style={{ display: 'contents' }}
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = `${urlPath}${getNewURL(params)}`;
        }}
      >
        {inputParam ? (
          <input
            className="ObjectiveInput"
            placeholder={inputPlaceholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        ) : (
          <span />
        )}
        <GoButton params={params} urlPath={urlPath} />
      </form>
    </>
  );
};

const GoButton: React.FC<{ params: Partial<PageParams>; urlPath: LangNavPageName }> = ({
  params,
  urlPath,
}) => {
  return (
    <a href={`${urlPath}${getNewURL(params)}`}>
      <button className="ObjectiveGoButton" type="submit">
        GO
      </button>
    </a>
  );
};

export default CommonObjectives;
