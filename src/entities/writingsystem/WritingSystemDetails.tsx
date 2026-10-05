import React, { useMemo } from 'react';

import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';
import PopulationWarning from '@widgets/PopulationWarning';

import { EntityRef } from '@features/data/api/list/tableContract';
import {
  toWritingSystemDetailQuery,
  useWritingSystemDetail,
  WritingSystemDetail,
} from '@features/data/api/writingsystem/writingSystemDetail';
import HoverableEntityRef from '@features/layers/hovercard/HoverableEntityRef';
import usePageParams from '@features/params/usePageParams';

import CommaSeparated from '@shared/ui/CommaSeparated';
import CornerSpinner from '@shared/ui/CornerSpinner';
import CountOfPeople from '@shared/ui/CountOfPeople';

type Props = {
  writingSystemID: string;
};

const WritingSystemDetails: React.FC<Props> = ({ writingSystemID }) => {
  const params = usePageParams();
  const query = useMemo(
    () => toWritingSystemDetailQuery(writingSystemID, params),
    [writingSystemID, params],
  );
  const { state } = useWritingSystemDetail(query);

  // Previous data from another writing system would sit under the new title, so it counts as loading.
  if (
    state.status === 'loading' ||
    (state.status === 'ready' && state.data.id !== writingSystemID)
  ) {
    return (
      <div className="Details">
        Loading...
        <CornerSpinner />
      </div>
    );
  }
  if (state.status === 'error') {
    return <div role="alert">Could not load these details: {state.message}</div>;
  }
  return (
    <>
      {state.stale && <CornerSpinner />}
      <WritingSystemDetailsBody detail={state.data} />
    </>
  );
};

const WritingSystemDetailsBody: React.FC<{ detail: WritingSystemDetail }> = ({ detail }) => {
  const { populationUpperBound, primaryLanguage, primaryLanguageCode, rightToLeft, sample } =
    detail;

  return (
    <div className="Details">
      <DetailsSection title="Attributes">
        <DetailsField title="Scope">{detail.scope}</DetailsField>
        {rightToLeft != null && (
          <DetailsField title="Direction">
            {rightToLeft ? 'Right to Left' : 'Left to Right'}
          </DetailsField>
        )}
        {sample && <DetailsField title="Sample">{sample}</DetailsField>}
        <DetailsField title="Unicode Support">
          {detail.unicodeVersion != null ? (
            `since version ${detail.unicodeVersion}`
          ) : (
            <em>Not supported by Unicode</em>
          )}
        </DetailsField>
        {(populationUpperBound ?? 0) > 100 && ( // Values less than 100 are suspicious and probably spurious
          <DetailsField
            title={
              <>
                Population (Upper Bound
                <PopulationWarning />)
              </>
            }
          >
            <CountOfPeople count={populationUpperBound} />
          </DetailsField>
        )}
      </DetailsSection>

      <DetailsSection title="Connections">
        {primaryLanguageCode != null && (
          <DetailsField title="Primary language">
            {primaryLanguage != null ? (
              <HoverableEntityRef entRef={primaryLanguage} />
            ) : (
              primaryLanguageCode
            )}
          </DetailsField>
        )}
        <RefList title="Languages" refs={detail.languages} />
        {detail.territoryOfOrigin && (
          <DetailsField title="Territory of Origin">
            <HoverableEntityRef entRef={detail.territoryOfOrigin} />
          </DetailsField>
        )}
        <RefList title="Locales (where writing system is explicit)" refs={detail.locales} />
        {detail.parent && (
          <DetailsField title="Originated from">
            <HoverableEntityRef entRef={detail.parent} />
          </DetailsField>
        )}
        <RefList title="Inspired" refs={detail.children} />
        <RefList title="Contains" refs={detail.contains} />
        <RefList title="Keyboards" refs={detail.keyboards} />
      </DetailsSection>
    </div>
  );
};

const RefList: React.FC<{ title: string; refs: EntityRef[] }> = ({ title, refs }) =>
  refs.length > 0 && (
    <DetailsField title={title}>
      <CommaSeparated>
        {refs.map((ref) => (
          <HoverableEntityRef key={ref.id} entRef={ref} />
        ))}
      </CommaSeparated>
    </DetailsField>
  );

export default WritingSystemDetails;
