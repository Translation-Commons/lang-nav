import { ConstructionIcon } from 'lucide-react';

import ScatterPlot from '@widgets/charts/ScatterPlot';

import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { getEntityTypeLabelPlural } from '@entities/lib/getEntityName';

import { Alert, AlertDescription, AlertTitle } from '@shared/ui/alert';

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
    <div className="text-sm flex flex-col items-center gap-2">
      <div>
        When interpreting this data, please note that much of the data is combined from various
        sources. While much effort was taken to smooth out differences in methodology,
        categorization, and completeness... there will be inconsistencies and gaps. Ideally, use
        this as general guidance but verify critical details independently.
      </div>
      <Alert className="max-w-md">
        <ConstructionIcon />
        <AlertTitle>Under construction</AlertTitle>
        <AlertDescription>
          This is a brand new component and will require tweaking. For instance, it is missing tick
          marks. Please give feedback with the feedback button at the top of the page.
        </AlertDescription>
      </Alert>
      <ScatterPlot />
    </div>
  );
};

export default ViewChart;
