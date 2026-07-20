import { ColorGradient } from './ColorTypes';
import { getColorGradientFunction } from './getColorGradientFunction';

function BaseColorBar({
  colorGradient,
  renormalize,
}: {
  colorGradient: ColorGradient;
  renormalize?: (value: number) => number;
}) {
  const colorFunc = getColorGradientFunction(colorGradient);
  return [...Array(100).keys()].map((i) => {
    return (
      <div
        key={i}
        className="inline-block h-full w-[1%]"
        style={{ backgroundColor: colorFunc(renormalize ? renormalize(i / 99) : i / 99) }}
      />
    );
  });
}

export default BaseColorBar;
