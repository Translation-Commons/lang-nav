import ScatterPlot from '@widgets/charts/ScatterPlot';

import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { getEntityTypeLabelPlural } from '@entities/lib/getEntityName';

const UNSUPPORTED_ENTITY_TYPES = [EntityType.Org, EntityType.Variant, EntityType.Keyboard];

const ViewChart: React.FC = () => {
  const { entType } = usePageParams();

  if (UNSUPPORTED_ENTITY_TYPES.includes(entType))
    return (
      <div>
        There is not enough data on {getEntityTypeLabelPlural(entType)} for this view to be useful.
      </div>
    );

  return (
    <div className="text-sm">
      When interpreting this data, please note that much of the data is combined from various
      sources. While much effort was taken to smooth out differences in methodology, categorization,
      and completeness... there will be inconsistencies and gaps. Ideally, use this as general
      guidance but verify critical details independently.
      <ScatterPlot />
    </div>
  );
};

export default ViewChart;
