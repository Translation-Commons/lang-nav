import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

const useAreParamsCurrent = () => {
  const pageParams = usePageParams();

  return (linkParams: Partial<PageParams>) =>
    Object.entries(linkParams).every(([key, value]) => {
      const paramValue = pageParams[key as keyof PageParams];
      if (Array.isArray(paramValue) && Array.isArray(value)) {
        return paramValue.sort().join(';') === value.sort().join(';');
      }
      return paramValue === value;
    });
};

export default useAreParamsCurrent;
