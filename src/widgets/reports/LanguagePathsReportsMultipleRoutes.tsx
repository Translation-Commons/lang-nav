import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import usePageParams from '@features/params/usePageParams';

import { LanguageCode, LanguageData } from '@entities/language/LanguageTypes';

import CollapsibleReport from '@shared/containers/CollapsibleReport';

import LanguagePath from './LanguagePathSimple';

type Props = {
  multipleRoutes: Record<LanguageCode, LanguageCode[][]>;
  getLanguage: (code: LanguageCode) => LanguageData | undefined;
};

const LanguagePathsReportMultipleRoutes: React.FC<Props> = ({ multipleRoutes, getLanguage }) => {
  const { limit } = usePageParams();
  // A known issue for multipleRoutes is when languages have been deprecated from ISO -- they may not be matched with glottolog entries.
  // Therefore, we should split up the multipleRoutes into 2 parts, one that includes deprecated ISO languages
  const [validMultipleRoutes, deprecatedMultipleRoutes] = Object.entries(multipleRoutes).reduce<
    [Record<LanguageCode, LanguageCode[][]>, Record<LanguageCode, LanguageCode[][]>]
  >(
    (acc, [langId, paths]) => {
      const hasDeprecatedPathParent = paths.some(
        (path) => getLanguage(path[0])?.ISO.retirementReason != null,
      );
      if (hasDeprecatedPathParent) {
        acc[1][langId] = paths;
      } else {
        acc[0][langId] = paths;
      }
      return acc;
    },
    [{}, {}],
  );

  return (
    <CollapsibleReport title="Languages with multiple routes">
      These languages can be reached by more than one distinct path from root languages. This
      usually indicates data issues, as languages should ideally have a single lineage.
      {Object.entries(multipleRoutes).length == 0 && <div>No multiple routes detected.</div>}
      {Object.entries(validMultipleRoutes).length > 0 && (
        <>
          The detected multiple paths are:
          <MultiplePathsList languageToPaths={validMultipleRoutes} getLanguage={getLanguage} />
        </>
      )}
      {Object.entries(deprecatedMultipleRoutes).length > 0 && (
        <>
          {Object.entries(validMultipleRoutes).length > 0 ? (
            <>
              Separately, the following languages have multiple routes but only when considering
              paths that include deprecated language codes.
            </>
          ) : (
            <>
              There are no duplicate routes with regular languages but there are some with
              deprecated languages.
            </>
          )}
          The deprecated language codes may need to be associated with actual glottolog languoids --
          OR they may be ignored since it may have been a bad category all along.
          <MultiplePathsList languageToPaths={deprecatedMultipleRoutes} getLanguage={getLanguage} />
        </>
      )}
      {Object.entries(multipleRoutes).length > limit && (
        <div>
          Showing only the first {limit} results. Adjust the &quot;limit&quot; parameter to see
          more.
        </div>
      )}
    </CollapsibleReport>
  );
};

const MultiplePathsList: React.FC<{
  languageToPaths: Record<LanguageCode, LanguageCode[][]>;
  getLanguage: (code: LanguageCode) => LanguageData | undefined;
}> = ({ languageToPaths, getLanguage }) => {
  const { limit } = usePageParams();
  return (
    <ul>
      {Object.entries(languageToPaths)
        .slice(0, limit)
        .map(([langId, paths], i) => (
          <li key={i}>
            <strong>
              <HoverableObjectName object={getLanguage(langId)} />
            </strong>
            <ul>
              {paths.map((path, j) => (
                <li key={j} style={{ marginLeft: '0.5em' }}>
                  <LanguagePath path={path} getLanguage={getLanguage} />
                </li>
              ))}
            </ul>
          </li>
        ))}
    </ul>
  );
};

export default LanguagePathsReportMultipleRoutes;
