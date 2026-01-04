import { TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableButton from '@features/layers/hovercard/HoverableButton';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { ObjectType, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import CellPopulation from '@shared/containers/CellPopulation';
import CountOfPeople from '@shared/ui/CountOfPeople';

import { LanguageData } from './LanguageTypes';

const LanguagePopulationFromDescendants: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  if (!lang.populationOfDescendants) return null;
  return (
    <>
      {lang.populationOfDescendants > (lang.populationEstimate ?? 0) ? (
        <Hoverable
          hoverContent={
            <>
              The sum of people that use this languoid&apos;s descendants is higher than the
              population estimate for this {lang.scope?.toLowerCase() ?? 'language'} -- probably
              because of multilingualism. For example, a simple sum for Arabic would double count
              people that understand both Standard Arabic and Vernacular Arabic.
            </>
          }
        >
          <TriangleAlertIcon
            style={{ color: 'var(--color-text-yellow)', marginRight: '0.25em' }}
            size="1em"
          />
        </Hoverable>
      ) : null}
      {lang.populationOfDescendants < (lang.populationEstimate ?? 0) * 0.5 ? (
        <Hoverable hoverContent="The population of descendants is significantly lower than the estimate -- probably because most data is collected for this entry as a whole.">
          <TriangleAlertIcon
            style={{ color: 'var(--color-text-secondary)', marginRight: '0.25em' }}
            size="1em"
          />
        </Hoverable>
      ) : null}
      <Hoverable hoverContent={<LanguagePopulationBreakdownFromDescendants lang={lang} />}>
        <CountOfPeople count={lang.populationOfDescendants} />
      </Hoverable>
    </>
  );
};

export const LanguagePopulationBreakdownFromDescendants: React.FC<{ lang: LanguageData }> = ({
  lang,
}) => {
  const { updatePageParams } = usePageParams();
  if (!lang.populationOfDescendants) return null;

  return (
    <>
      Computed by adding up constituent languages/dialects. This algorithm is still a work in
      progress so numbers may not satisfyingly add up.
      <table>
        <tbody>
          {lang.childLanguages
            .sort((a, b) => (b.populationEstimate ?? 0) - (a.populationEstimate ?? 0))
            .slice(0, 10) // limit to first 10
            .map((descendant) => (
              <tr key={descendant.ID}>
                <td>
                  <HoverableObjectName object={descendant} />
                </td>
                <CellPopulation population={descendant.populationEstimate} />
              </tr>
            ))}
          {lang.childLanguages.length > 10 && (
            <tr>
              <td>+{lang.childLanguages.length - 10} more</td>
              <CellPopulation
                population={lang.childLanguages
                  .slice(10)
                  .reduce((sum, descendant) => sum + (descendant.populationEstimate || 0), 0)}
              />
            </tr>
          )}
        </tbody>
      </table>
      <HoverableButton
        onClick={() =>
          updatePageParams({
            languageFilter: lang.nameDisplay + ' [' + lang.ID + ']',
            view: View.Table,
            objectType: ObjectType.Language,
          })
        }
        style={{ display: 'block' }}
      >
        See all descendants in the language table
      </HoverableButton>
    </>
  );
};

export default LanguagePopulationFromDescendants;
