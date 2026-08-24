import { TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableButton from '@features/layers/hovercard/HoverableButton';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { EntityType, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import CellPopulation from '@shared/containers/CellPopulation';
import CountOfPeople from '@shared/ui/CountOfPeople';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

import { LanguageData } from '../LanguageTypes';

type Props = {
  lang: LanguageData;
  speakingOrWriting: 'speaking' | 'writing';
};

const LanguagePopulationFromDescendants: React.FC<Props> = ({ lang, speakingOrWriting }) => {
  const pop = lang.pop[speakingOrWriting];
  if (pop.estimate == null || pop.descendants == null) return null;
  return (
    <>
      {(pop.descendants ?? 0) > (pop.estimate ?? 0) ? (
        <Hoverable
          hoverContent={
            <>
              The sum of people that use this languoid&apos;s descendants is higher than the
              population estimate for this {getLanguageScopeLabel(lang.scope).toLowerCase()} --
              probably because of multilingualism. For example, a simple sum for Arabic would double
              count people that understand both Standard Arabic and Vernacular Arabic.
            </>
          }
        >
          <TriangleAlertIcon
            style={{ color: 'var(--color-yellow)', marginRight: '0.25em' }}
            size="1em"
          />
        </Hoverable>
      ) : null}
      {pop.descendants < (pop.estimate ?? 0) * 0.5 ? (
        <Hoverable hoverContent="The population of descendants is significantly lower than the estimate -- probably because most data is collected for this entry as a whole.">
          <TriangleAlertIcon
            style={{ color: 'var(--color-text-secondary)', marginRight: '0.25em' }}
            size="1em"
          />
        </Hoverable>
      ) : null}
      <Hoverable
        hoverContent={
          <LanguagePopulationBreakdownFromDescendants
            lang={lang}
            speakingOrWriting={speakingOrWriting}
          />
        }
      >
        <CountOfPeople count={pop.descendants} />
      </Hoverable>
    </>
  );
};

export const LanguagePopulationBreakdownFromDescendants: React.FC<Props> = ({
  lang,
  speakingOrWriting,
}) => {
  const { updatePageParams } = usePageParams();
  if (!lang.pop[speakingOrWriting].descendants) return null;

  return (
    <>
      Computed by adding up constituent languages/dialects. This algorithm is still a work in
      progress so numbers may not satisfyingly add up.
      <table>
        <tbody>
          {lang.childLanguages
            .slice()
            .sort(sortByPopulation)
            .slice(0, 10) // limit to first 10
            .map((descendant) => (
              <tr key={descendant.ID}>
                <td>
                  <HoverableObjectName ent={descendant} />
                </td>
                <CellPopulation population={descendant.pop[speakingOrWriting].estimate} />
              </tr>
            ))}
          {lang.childLanguages.length > 10 && (
            <tr>
              <td>+{lang.childLanguages.length - 10} more</td>
              <CellPopulation
                population={lang.childLanguages
                  .slice(10)
                  .reduce(
                    (sum, descendant) => sum + (descendant.pop[speakingOrWriting].estimate || 0),
                    0,
                  )}
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
            entityType: EntityType.Language,
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
