import React from 'react';

import ObjectMap from '@features/map/ObjectMap';

import { LanguageData } from '@entities/language/LanguageTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import Deemphasized from '@shared/ui/Deemphasized';
import Pill from '@shared/ui/Pill';

const LanguageLocation: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  return (
    <DetailsSection title="Location">
      <DetailsField title="Coordinates:">
        {lang.latitude && lang.longitude ? (
          <>
            {lang.latitude.toFixed(4)}°, {lang.longitude.toFixed(4)}° <Pill>Glottolog</Pill>
          </>
        ) : (
          <Deemphasized>No coordinate data available.</Deemphasized>
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
    </DetailsSection>
  );
};

export default LanguageLocation;
