import React, { useState } from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import { getNewURL } from '@features/params/getNewURL';
import { ObjectType, PageParamKey, PageParams, View } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';

import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';

const CommonObjectives: React.FC = () => {
  return (
    <div className="mx-auto my-8 max-w-xl px-4 text-center">
      <h2 className="mb-2 text-2xl font-semibold">Common Objectives</h2>
      <ObjectiveList />
    </div>
  );
};

export const ObjectiveList: React.FC = () => {
  return (
    <div className="mx-auto grid w-full gap-2 text-left sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-x-3 sm:gap-y-2">
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
    <form
      className="flex flex-col gap-1 sm:col-span-3 sm:grid sm:grid-cols-subgrid sm:items-center sm:gap-x-3 sm:gap-y-0"
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = `${urlPath}${getNewURL(params)}`;
      }}
    >
      <span className="sm:col-start-1">{label}</span>
      <div className="flex items-center gap-2 sm:contents">
        {inputParam && (
          <Input
            className="h-8 grow sm:col-start-2 sm:h-7 sm:w-52 sm:grow-0"
            aria-label={inputPlaceholder}
            placeholder={inputPlaceholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        )}
        <Button type="submit" size="sm" variant="secondary" className="shrink-0 sm:col-start-3">
          GO
        </Button>
      </div>
    </form>
  );
};

export default CommonObjectives;
