import usePagination from '@features/pagination/usePagination';
import VisibleItemsMeter from '@features/pagination/VisibleItemsMeter';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { LanguageData } from '@entities/language/LanguageTypes';

import DigitalSupportTable from './DigitalSupportTable';

const DigitalSupportScorecard = () => {
  const { getCurrentEntities } = usePagination<LanguageData>();
  const { filteredEntities, isPending, allEntities } = useFilteredEntities<LanguageData>({});
  const currentEntities = getCurrentEntities(filteredEntities);

  return (
    <div className="flex flex-col gap-4 items-center">
      <VisibleItemsMeter ents={allEntities} />
      <DigitalSupportTable ents={currentEntities} isPending={isPending} />
    </div>
  );
};

export default DigitalSupportScorecard;
