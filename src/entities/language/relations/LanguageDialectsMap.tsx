import { SquareArrowUpLeftIcon } from 'lucide-react';
import { useMemo } from 'react';

import { getEntityFullDescendants } from '@widgets/pathnav/getParentsAndDescendants';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import EntityMap from '@features/map/EntityMap';
import { EntityType, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import { partition } from '@shared/lib/setUtils';
import { Button } from '@shared/ui/button';
import CommaSeparated from '@shared/ui/CommaSeparated';

type Props = {
  lang: LanguageData;
};
function LanguageDialectsMap({ lang }: Props) {
  const { updatePageParams } = usePageParams();
  const sortFunction = getSortFunction();

  const dialects = useMemo(
    () =>
      getEntityFullDescendants(lang)
        .filter(
          (l) =>
            l.type === EntityType.Language &&
            (l.scope === LanguageScope.Dialect || l.scope === LanguageScope.Language),
        )
        .sort(sortFunction) as LanguageData[],
    [lang, sortFunction],
  );

  const [dialectsWithCoords, dialectsWithoutCoords] = partition(
    [lang, ...dialects],
    (d) => d.latitude != null && d.longitude != null,
  );
  return (
    <div className="flex flex-col gap-2">
      <div>
        This map shows the center of the dialect. It does not capture every location that the
        dialect is used.{' '}
        <Button
          className="cursor-pointer"
          onClick={() =>
            updatePageParams({
              view: View.Map,
              languageFilter: lang.nameCanonical + ' [' + lang.ID + ']',
            })
          }
          variant="secondary"
        >
          <SquareArrowUpLeftIcon /> See the full map in the explore panel
        </Button>
      </div>
      <EntityMap entities={dialectsWithCoords} maxWidth={1000} />
      {dialectsWithoutCoords.length > 0 && (
        <div>
          Dialects without coordinates:{' '}
          <CommaSeparated>
            {dialectsWithoutCoords.map((d) => (
              <HoverableEntityName ent={d} key={d.ID} />
            ))}
          </CommaSeparated>
        </div>
      )}
    </div>
  );
}

export default LanguageDialectsMap;
