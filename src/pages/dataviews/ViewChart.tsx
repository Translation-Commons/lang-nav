import ScatterPlot from '@widgets/charts/ScatterPlot';

const ViewChart: React.FC = () => {
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
