import React from 'react';

import DocsPageContainer from '@widgets/docs/DocsPageContainer';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

const FieldCoverageTable = React.lazy(
  () => import('@features/transforms/fields/FieldCoverageTable'),
);

const DataCoveragePage: React.FC = () => {
  return (
    <DocsPageContainer title="Data Coverage">
      <p>
        This table shows the coverage of different fields across all entities in LangNav. This shows
        both the capabilities for different fields as well as potential gaps in user experience or
        data. Fields colored in yellow or with superscript notes may need revision in the interface.
      </p>
      <p>
        Technical details: <code className="text-[12px]">FieldApplicability.ts</code> controls
        whether a field appears for an entity type (and for which transforms it appears for, eg.
        sorting, coloring, filtering). <code className="text-[12px]">getField.ts</code> gets numeric
        or string representations of fields for these transforms.{' '}
        <code className="text-[12px]">EntityFieldDisplay.tsx</code> generally gets nicely formatted
        versions of the field value, sometimes with hoverable explanations.{' '}
        <code className="text-[12px]">FieldLabelStrings.ts</code> provides labels and explanations
        for each field, sometimes tailored to the entity type.
      </p>
      <div className="overflow-x-auto 2xl:-mx-[300px]">
        <div className="mx-auto w-fit">
          <ContainErrorsAndSuspense>
            <FieldCoverageTable />
          </ContainErrorsAndSuspense>
        </div>
      </div>
    </DocsPageContainer>
  );
};

export default DataCoveragePage;
