import { useLocation } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import ReportID from '@widgets/reports/ReportID';

import { getNewURLSearchParams } from '@features/params/getNewURLSearchParams';
import { EntityType, PageParams, View } from '@features/params/PageParamTypes';

import useAreParamsCurrent from './useAreParamsCurrent';

export type NavBarTool = {
  label: string;
  page: LangNavPageName;
  params: Partial<PageParams>;
};

export const NAV_BAR_TOOLS: NavBarTool[] = [
  {
    label: 'Language Decoder',
    page: LangNavPageName.Decoder,
    params: { entType: EntityType.Language },
  },
  {
    label: 'Census Validation',
    page: LangNavPageName.Data,
    params: { entType: EntityType.Census, view: View.Reports, reportID: ReportID.CensusInputTool },
  },
  {
    label: 'Plurals',
    page: LangNavPageName.Data,
    params: {
      entType: EntityType.Language,
      view: View.Reports,
      reportID: ReportID.LanguagePlurals,
    },
  },
];

export function getToolURL({ page, params }: NavBarTool): string {
  const query = getNewURLSearchParams(params).toString();
  return '/' + page + (query ? '?' + query : '');
}

export function useIsToolOpen(): (tool: NavBarTool) => boolean {
  const areParamsCurrent = useAreParamsCurrent();
  const location = useLocation();

  return (tool) =>
    tool.page === LangNavPageName.Decoder
      ? location.pathname === '/' + tool.page
      : areParamsCurrent(tool.params);
}
