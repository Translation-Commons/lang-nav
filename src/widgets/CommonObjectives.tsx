import React, { useState } from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import { getNewURL } from '@features/params/getNewURL';
import { EntityType, PageParamKey, PageParams, View } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';

import { Button } from '@shared/ui/button';

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
        urlPath={LangNavPageName.Lucky}
      />
      <Objective
        label="See the languages in a country."
        inputPlaceholder="Enter a country"
        inputParam={PageParamKey.territoryFilter}
        urlParams={{ view: View.Table, entType: EntityType.Locale }}
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
    <div style={{ marginBottom: '0.5em' }}>
      {label}
      <form
        className="inline-flex items-center"
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = `${urlPath}${getNewURL(params)}`;
        }}
      >
        {inputParam && (
          <input
            className="ml-2 h-7 rounded-md border px-2 text-xs/relaxed outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            placeholder={inputPlaceholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        )}
        <GoButton params={params} urlPath={urlPath} />
      </form>
    </div>
  );
};

const GoButton: React.FC<{ params: Partial<PageParams>; urlPath: LangNavPageName }> = ({
  params,
  urlPath,
}) => {
  return (
    <a className="ml-2" href={`${urlPath}${getNewURL(params)}`}>
      <Button type="submit">GO</Button>
    </a>
  );
};

export default CommonObjectives;
