import React from 'react';

import { getObjectFullDescendants } from '@widgets/pathnav/getParentsAndDescendants';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import ObjectMap from '@features/map/ObjectMap';
import { ObjectType, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import Deemphasized from '@shared/ui/Deemphasized';
import Pill from '@shared/ui/Pill';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

const LanguageLocation: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { updatePageParams, limit } = usePageParams();
  const sortFunction = getSortFunction();
  const descendants = getObjectFullDescendants(lang)
    .filter((l) => l.type === ObjectType.Language && l.latitude != null && l.longitude != null)
    .sort(sortFunction) as LanguageData[];

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
          These are the locations of descendant languages/dialects.
          {descendants.length > limit && (
            <Deemphasized>
              {' '}
              Showing first {limit} of {descendants.length}.
            </Deemphasized>
          )}
          <ObjectMap objects={descendants} maxWidth={400} />
          <HoverableButton
            onClick={() =>
              updatePageParams({
                view: View.Map,
                languageFilter: lang.nameCanonical + ' [' + lang.ID + ']',
                objectID: undefined,
              })
            }
          >
            See more in Map view
          </HoverableButton>
        </>
      )}
    </DetailsSection>
  );
};

export default LanguageLocation;
