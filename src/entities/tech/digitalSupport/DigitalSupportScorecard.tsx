import usePagination from '@features/pagination/usePagination';
import VisibleItemsMeter from '@features/pagination/VisibleItemsMeter';
import ColorGradientSelector from '@features/transforms/coloring/ColorGradientSelector';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { LanguageData } from '@entities/language/LanguageTypes';

import { DigitalSupportProvider } from './DigitalSupportContext';
import DigitalSupportOptions from './DigitalSupportOptions';
import DigitalSupportTable from './DigitalSupportTable';

const DigitalSupportScorecard = () => {
  const { getCurrentEntities } = usePagination<LanguageData>();
  const { filteredEntities, isPending, allEntities } = useFilteredEntities<LanguageData>({});
  const currentEntities = getCurrentEntities(filteredEntities);

  return (
    <div className="flex flex-col gap-4 items-center">
      <DigitalSupportProvider>
        <div>
          Everything is given a score of 0 to 100 -- most factors are binary but some have steps to
          indicate partial support.
        </div>
        <div className="flex items-center gap-2">
          <div>
            Color gradient:
            <ColorGradientSelector />
          </div>
        </div>
        <DigitalSupportOptions />
        <VisibleItemsMeter ents={allEntities} />
        <DigitalSupportTable ents={currentEntities} isPending={isPending} />
      </DigitalSupportProvider>
    </div>
  );
};

export default DigitalSupportScorecard;
