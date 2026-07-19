import usePageParams from '@features/params/usePageParams';

function LargeLangNavLogo({ width = 120, className }: { width?: number; className?: string }) {
  const { pageBrightness } = usePageParams().brightness;

  return (
    <img
      src={`/lang-nav/logo/LangNavLogo${pageBrightness === 'dark' ? 'Dark' : ''}.svg`}
      width={`${width}px`}
      height={`${width / 2}px`}
      alt="LangNav Logo"
      className={className}
    />
  );
}

export default LargeLangNavLogo;
