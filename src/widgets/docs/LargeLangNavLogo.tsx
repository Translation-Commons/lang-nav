import { usePageBrightness } from '@shared/hooks/usePageBrightness';

function LargeLangNavLogo() {
  const { pageBrightness } = usePageBrightness();

  return (
    <img
      src={`/lang-nav/logo/LangNavLogo${pageBrightness === 'dark' ? 'Dark' : ''}.svg`}
      width="120px"
      height="60px"
      alt="LangNav Logo"
    />
  );
}

export default LargeLangNavLogo;
