import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import ObjectMap from '@features/map/ObjectMap';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { ObjectType, PageParamsOptional, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import useFilteredObjects from '@features/transforms/filtering/useFilteredObjects';

import { LanguageData } from '@entities/language/LanguageTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import Deemphasized from '@shared/ui/Deemphasized';
import Pill from '@shared/ui/Pill';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

const MAP_CIRCLE_LIMIT = 200;

const LanguageLocation: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { updatePageParams } = usePageParams();

  return (
    <DetailsSection title="Location">
      <DetailsField title="Coordinates">
        {lang.latitude && lang.longitude ? (
          <>
            {lang.latitude.toFixed(4)}°, {lang.longitude.toFixed(4)}° <Pill>Glottolog</Pill>
          </>
        ) : (
          <Deemphasized>
            No coordinate data for this {getLanguageScopeLabel(lang.scope).toLowerCase()} available.
          </Deemphasized>
        )}
      </DetailsField>

      {/* Show maps with local params to customize this for the language without interfering with explore surface params */}
      <LocalParamsProvider
        overrides={{
          limit: MAP_CIRCLE_LIMIT,
          objectType: ObjectType.Language,
          languageFilter: lang.nameCanonical + ' [' + lang.ID + ']',
          sortBy: Field.Population,
        }}
      >
        <Maps lang={lang} updatePageParams={updatePageParams} />
      </LocalParamsProvider>
    </DetailsSection>
  );
};

type MapsProps = {
  lang: LanguageData;
  // Updating the global page params, not the local params
  updatePageParams: (newParams: PageParamsOptional) => void;
};
function Maps({ lang, updatePageParams }: MapsProps) {
  const descendants = useFilteredObjects({}).filteredObjects;
  return (
    <>
      {lang.latitude && lang.longitude ? (
        <>
          These coordinates show the &quot;primary&quot; location of the language, as defined by
          Glottolog. This could be the centroid of the area where the language is spoken, or a
          significant location such as a major city where the language has a presence. It does not
          represent all the locations where the language is spoken.
          <ObjectMap objects={[lang]} maxWidth={400} />
        </>
      ) : null}
      {descendants.length > 0 && (
        <>
          <div>
            These are the locations of descendant languages/dialects.
            {descendants.length > MAP_CIRCLE_LIMIT && (
              <Deemphasized>
                {' '}
                Showing first {MAP_CIRCLE_LIMIT} of {descendants.length}.
              </Deemphasized>
            )}{' '}
            <HoverableButton
              style={{ padding: '0.25em' }}
              onClick={() =>
                updatePageParams({
                  view: View.Map,
                  languageFilter: lang.nameCanonical + ' [' + lang.ID + ']',
                })
              }
            >
              See the full map in explore panel
            </HoverableButton>
          </div>
          <ObjectMap objects={descendants} maxWidth={1000} />
        </>
      )}
    </>
  );
}

export default LanguageLocation;
