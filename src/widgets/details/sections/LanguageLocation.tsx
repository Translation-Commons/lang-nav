import { CheckSquare2Icon, SquareArrowUpLeftIcon, SquareIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import EntityMap from '@features/map/EntityMap';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { ObjectType, PageParams, View } from '@features/params/PageParamTypes';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import LanguageScopeSelector from '@features/transforms/filtering/selectors/LanguageScopeSelector';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { LanguageData, LanguageSource } from '@entities/language/LanguageTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import Deemphasized from '@shared/ui/Deemphasized';
import Pill from '@shared/ui/Pill';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

const MAP_CIRCLE_LIMIT = 100;

const LanguageLocation: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { updatePageParams } = usePageParams();

  return (
    <DetailsSection title="Location">
      <DetailsField title="Coordinates">
        {lang.latitude != null && lang.longitude != null ? (
          <>
            {lang.latitude.toFixed(4)}°, {lang.longitude.toFixed(4)}°{' '}
            {lang.coordsSource && <Pill>{lang.coordsSource}</Pill>}
            {lang.coordsSource === LanguageSource.Glottolog && (
              <>
                {' '}
                These coordinates represent the &quot;primary&quot; location of the{' '}
                {getLanguageScopeLabel(lang.scope).toLowerCase()}. This could be the centroid of the
                area where the language is spoken or a significant location such as a major city for
                which the language is known.
              </>
            )}
            {lang.coordsSource === LanguageSource.Combined && (
              <>
                {' '}
                These coordinates represent the average location of the constituents of this{' '}
                {getLanguageScopeLabel(lang.scope).toLowerCase()}.
              </>
            )}
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
          searchString: '',
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
  updatePageParams: (newParams: Partial<PageParams>) => void;
};
function Maps({ lang, updatePageParams }: MapsProps) {
  const [showConstituents, setShowConstituents] = React.useState(true);
  const nodes = useFilteredEntities<LanguageData>({}).filteredEntities; // Use a LocalParamsProvider to limit the visible entities
  const drawableNodes = useMemo(
    () => [
      lang, // always show the selected language
      ...nodes.filter((l) => l.ID !== lang.ID && l.latitude != null && l.longitude != null),
    ],
    [lang, nodes],
  );
  if (nodes.length === 0) return null;
  return (
    <>
      <div>
        This map shows the center of the {getLanguageScopeLabel(lang.scope).toLowerCase()}
        {drawableNodes.length > 1 ? ' and its constituents' : ''}. It does not capture every
        location that the {getLanguageScopeLabel(lang.scope).toLowerCase()} is used.{' '}
        <HoverableButton
          style={{ padding: '0.25em', display: 'inline-flex', alignItems: 'center', gap: '0.25em' }}
          onClick={() =>
            updatePageParams({
              view: View.Map,
              languageFilter: lang.nameCanonical + ' [' + lang.ID + ']',
            })
          }
        >
          <SquareArrowUpLeftIcon size="1em" /> See the full map in the explore panel
        </HoverableButton>{' '}
        {drawableNodes.length > 1 && (
          <HoverableButton
            style={{
              padding: '0.25em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25em',
            }}
            onClick={() => setShowConstituents((prev) => !prev)}
            hoverContent={showConstituents ? 'Hide constituents' : 'Show constituents'}
          >
            {showConstituents ? <CheckSquare2Icon size="1em" /> : <SquareIcon size="1em" />}
            {showConstituents ? ' Showing constituents' : ' Not showing constituents'}
            {showConstituents && drawableNodes.length > MAP_CIRCLE_LIMIT && (
              <Deemphasized>
                {' '}
                (first {MAP_CIRCLE_LIMIT} of {drawableNodes.length})
              </Deemphasized>
            )}
          </HoverableButton>
        )}
      </div>
      <div style={{ margin: '.5em 0' }}>
        <EntityMap entities={showConstituents ? drawableNodes : [lang]} maxWidth={1000} />
      </div>
      {showConstituents && drawableNodes.length > 1 && (
        <LanguageScopeSelector display={SelectorDisplay.Dropdown} />
      )}
    </>
  );
}

export default LanguageLocation;
