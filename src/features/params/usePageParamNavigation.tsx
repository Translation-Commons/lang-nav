import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import { getNewURLSearchParams } from './getNewURLSearchParams';
import { PageParams } from './PageParamTypes';

type Props = {
  keepOldParams?: boolean;
  page?: LangNavPageName;
};

const usePageParamNavigation = ({ keepOldParams = false, page = LangNavPageName.Data }: Props) => {
  const navigate = useNavigate();
  const [oldParams] = useSearchParams({});

  const updatePage = useCallback(
    (newParams: Partial<PageParams>) => {
      const searchParams = getNewURLSearchParams(newParams, keepOldParams ? oldParams : undefined);
      navigate({ pathname: '/' + page, search: searchParams.toString() });
    },
    [navigate, keepOldParams, oldParams],
  );

  return updatePage;
};

export default usePageParamNavigation;
