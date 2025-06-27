import React, { useCallback } from 'react';

import { toTitleCase } from '../../generic/stringUtils';
import { useMediaQuery } from '../../generic/useMediaQuery';
import { ObjectType, View } from '../../types/PageParamTypes';
import { getObjectTypeLabelPlural } from '../../views/common/getObjectName';
import Selector from '../components/Selector';
import SingleChoiceOptions from '../components/SingleChoiceOptions';
import { usePageParams } from '../PageParamsContext';

const objectAmbiguousViews = [View.About, View.Details];

const ObjectTypeSelector: React.FC = () => {
  const { objectType, replaceAllParams, view } = usePageParams();
  const isCompact = useMediaQuery('(max-width: 1015px)');

  const goToObjectType = useCallback(
    (newObjectType: ObjectType) => {
      const targetView = objectAmbiguousViews.includes(view) ? View.CardList : view;

      console.log(`ObjectTypeSelector: Changing objectType to ${newObjectType}. Resetting all params.`);

      replaceAllParams({
        objectType: newObjectType,
        view: targetView,
        page: 1,
        searchString: '',
      });
    },
    [replaceAllParams, view],
  );

  return (
    <Selector selectorLabel={isCompact ? 'Data:' : undefined} appearance="tabs">
      <SingleChoiceOptions<ObjectType>
        options={Object.values(ObjectType)}
        onChange={goToObjectType}
        mode={isCompact ? 'dropdown' : 'flat'}
        selected={objectType}
        getOptionLabel={(d) => toTitleCase(getObjectTypeLabelPlural(d))}
        getOptionDescription={(objectType) => (
          <>
            <div style={{ marginBottom: 8 }}>Click here to change the kind of entity viewed.</div>
            <OptionDescription objectType={objectType} />
          </>
        )}
      />
    </Selector>
  );
};

const OptionDescription: React.FC<{ objectType: ObjectType }> = ({ objectType }) => {
  switch (objectType) {
    case ObjectType.Language:
      return (
        <>
          <label>Language (Languoid):</label>A verbal communication system used by multiple people.
          Languages should be are mutually intelligible, whereas a dialect is a subset of a language
          defined by differences in lexicon and pronounciation. Since languages families, contested
          languages, and dialects are included it is more precise to consider these
          &quot;Languoids&quot;.
        </>
      );
    case ObjectType.Locale:
      return (
        <>
          <label>Locale:</label>The combination of a language and territory -- used to express how
          many people speak a language in a given area or if a language is officially supported.
          Some locales specific a particular writing system and/or variation information (dialect,
          orthography...).
        </>
      );
    case ObjectType.Territory:
      return (
        <>
          <label>Territory:</label>A geographical unit. Some may not have universal recognition.
          Currently showing both countries as well as dependencies (eg. Hong Kong) that have
          separate ISO codes.
        </>
      );
    case ObjectType.WritingSystem:
      return (
        <>
          <label>Writing System:</label>A system for writing a language to a persistent visual
          media. For instance Latin alphabet, Han characters, cursive Arabic script. Some systems
          may contain other systems.
        </>
      );
  }
};

export default ObjectTypeSelector;
