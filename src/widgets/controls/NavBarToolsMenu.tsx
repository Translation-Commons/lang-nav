import { useLocation } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import ReportID from '@widgets/reports/ReportID';

import PopupCard from '@features/layers/popupcard/PopupCard';
import InternalLink from '@features/params/InternalLink';
import { EntityType, View } from '@features/params/PageParamTypes';

import useAreParamsCurrent from './useAreParamsCurrent';

const NOTABLE_REPORTS = [
  {
    label: 'Census Validation',
    params: {
      entType: EntityType.Census,
      view: View.Reports,
      reportID: ReportID.CensusInputTool,
    },
  },
  {
    label: 'Plurals',
    params: {
      entType: EntityType.Language,
      view: View.Reports,
      reportID: ReportID.LanguagePlurals,
    },
  },
];

const NavBarToolsMenu: React.FC = () => {
  const areParamsCurrent = useAreParamsCurrent();
  const location = useLocation();

  return (
    <PopupCard
      buttonClassName="primary h-full p-2 text-xl font-normal"
      buttonLabel="Tools"
      body={
        <div className="flex flex-col gap-2 text-sm">
          <InternalLink
            page={LangNavPageName.Decoder}
            className={'text-nowrap' + (location.pathname === '/decoder' ? ' font-bold' : '')}
            params={{ entType: EntityType.Language }}
          >
            Language Decoder
          </InternalLink>
          {NOTABLE_REPORTS.map((tool) => (
            <InternalLink
              key={tool.label}
              page={LangNavPageName.Data}
              className={'text-nowrap' + (areParamsCurrent(tool.params) ? ' font-bold' : '')}
              params={tool.params}
            >
              {tool.label}
            </InternalLink>
          ))}
        </div>
      }
    />
  );
};

export default NavBarToolsMenu;
