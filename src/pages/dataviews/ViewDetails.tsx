import React from 'react';

import EntityPath from '@widgets/pathnav/EntityPath';
import { PathContainer } from '@widgets/pathnav/PathNav';

import usePageParams from '@features/params/usePageParams';
import SearchCombobox from '@features/transforms/search/SearchCombobox';

import getEntityFromID from '@entities/lib/getEntityFromID';
import EntityTitle from '@entities/ui/EntityTitle';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

const EntityDetailsBody = React.lazy(() => import('@widgets/details/EntityDetailsBody'));

const ViewDetails: React.FC = () => {
  const { cmpID, entType } = usePageParams();
  const ent = getEntityFromID(cmpID);

  if (!ent) return <EmptyDetails />;

  return (
    <div className="flex flex-col gap-4 max-w-[900px] mx-auto">
      <div className="w-full flex flex-col justify-center text-center relative pt-3 px-2">
        <div className="text-4xl font-bold">
          <EntityTitle ent={ent} highlightSearchMatches={false} />
        </div>
        <div className="text-lg italic font-light">{ent.nameEndonym}</div>
      </div>
      <div>
        <PathContainer className="mb-2">
          <EntityPath ent={ent} />
        </PathContainer>
        <ContainErrorsAndSuspense>
          {ent && <EntityDetailsBody ent={ent} />}
        </ContainErrorsAndSuspense>
        {!ent && (
          <>
            In the comparison view, select a {entType.toLowerCase()} by clicking on its name to see
            more information.
          </>
        )}
      </div>
    </div>
  );
};

const EmptyDetails: React.FC = () => {
  return <SearchCombobox />;
};

export default ViewDetails;
