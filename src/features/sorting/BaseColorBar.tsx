import { getColorGradientFunction } from './getColorGradientFunction';
import { ColorGradient } from './SortTypes';

function BaseColorBar({ colorGradient }: { colorGradient: ColorGradient }) {
  const colorFunc = getColorGradientFunction(colorGradient);
  return [...Array(100).keys()].map((i) => {
    return (
      <div
        key={i}
        style={{
          backgroundColor: colorFunc(i / 99),
          width: '1%',
          height: '100%',
          display: 'inline-block',
        }}
      />
    );
  });
}

export default BaseColorBar;
