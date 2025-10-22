import { TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import HoverableObjectName from '@entities/ui/HoverableObjectName';

import Hoverable from '@shared/ui/Hoverable';

import { LanguageData } from './LanguageTypes';

const LanguagePopulationFromDescendents: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  if (!lang.populationOfDescendents) return null;
  return (
    <>
      {lang.populationOfDescendents > (lang.populationEstimate ?? 0) ? (
        <Hoverable hoverContent="Computed population of descendants exceeds population estimate.">
          <TriangleAlertIcon
            style={{ color: 'var(--color-text-yellow)', marginRight: '0.25em' }}
            size="1em"
          />
        </Hoverable>
      ) : null}
      {lang.populationOfDescendents < (lang.populationEstimate ?? 0) * 0.5 ? (
        <Hoverable hoverContent="The population of descendants is significantly lower than the estimate -- probably because most data is collected for this entry as a whole.">
          <TriangleAlertIcon
            style={{ color: 'var(--color-text-secondary)', marginRight: '0.25em' }}
            size="1em"
          />
        </Hoverable>
      ) : null}
      <Hoverable hoverContent={<PopulationOfDescendentsBreakdown lang={lang} />}>
        {lang.populationOfDescendents.toLocaleString()}
      </Hoverable>
    </>
  );
};

const PopulationOfDescendentsBreakdown: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  if (!lang.populationOfDescendents) return null;

  return (
    <>
      Computed by adding up constituent languages/dialects.
      <table>
        <tbody>
          {lang.childLanguages
            .sort((a, b) => (b.populationEstimate ?? 0) - (a.populationEstimate ?? 0))
            .slice(0, 10) // limit to first 10
            .map((descendent) => (
              <tr key={descendent.ID}>
                <td>
                  <HoverableObjectName object={descendent} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  {descendent.populationEstimate?.toLocaleString()}
                </td>
              </tr>
            ))}
          {lang.childLanguages.length > 10 && (
            <tr>
              <td>+{lang.childLanguages.length - 10} more</td>
              <td style={{ textAlign: 'right' }}>
                {lang.childLanguages
                  .slice(10)
                  .reduce((sum, descendent) => sum + (descendent.populationEstimate || 0), 0)
                  .toLocaleString()}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default LanguagePopulationFromDescendents;
