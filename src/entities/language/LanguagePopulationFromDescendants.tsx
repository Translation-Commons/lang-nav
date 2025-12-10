import { TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import CountOfPeople from '@shared/ui/CountOfPeople';

import { LanguageData } from './LanguageTypes';

const LanguagePopulationFromDescendants: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  if (!lang.populationOfDescendants) return null;
  return (
    <>
      {lang.populationOfDescendants > (lang.populationEstimate ?? 0) ? (
        <Hoverable hoverContent="Computed population of descendants exceeds population estimate.">
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
      <Hoverable hoverContent={<PopulationOfDescendantsBreakdown lang={lang} />}>
        <CountOfPeople count={lang.populationOfDescendants} />
      </Hoverable>
    </>
  );
};

const PopulationOfDescendantsBreakdown: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  if (!lang.populationOfDescendants) return null;

  return (
    <>
      Computed by adding up constituent languages/dialects.
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
                <td style={{ textAlign: 'right' }}>
                  <CountOfPeople count={descendant.populationEstimate} />
                </td>
              </tr>
            ))}
          {lang.childLanguages.length > 10 && (
            <tr>
              <td>+{lang.childLanguages.length - 10} more</td>
              <td style={{ textAlign: 'right' }}>
                <CountOfPeople
                  count={lang.childLanguages
                    .slice(10)
                    .reduce((sum, descendant) => sum + (descendant.populationEstimate || 0), 0)}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default LanguagePopulationFromDescendants;
