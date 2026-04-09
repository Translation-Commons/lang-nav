import usePageParams from '@features/params/usePageParams';

function LargeLangNavLogo({ width = 120 }: { width?: number }) {
  const { pageBrightness } = usePageParams().brightness;

  return (
    <img
      src={`/lang-nav/logo/LangNavLogo${pageBrightness === 'dark' ? 'Dark' : ''}.svg`}
      width={`${width}px`}
      height={`${width / 2}px`}
      alt="LangNav Logo"
    />
  );
}

export default LargeLangNavLogo;
