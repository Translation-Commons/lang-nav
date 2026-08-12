import { LangNavPageName } from '@app/PageRoutes';

import ReportID from '@widgets/reports/ReportID';

import PopupCard from '@features/layers/popupcard/PopupCard';
import InternalLink from '@features/params/InternalLink';
import { ObjectType, View } from '@features/params/PageParamTypes';

import useAreParamsCurrent from './useAreParamsCurrent';

const TOOLS = [
  {
    label: 'Census Validation',
    params: {
      objectType: ObjectType.Census,
      view: View.Reports,
      reportID: ReportID.CensusInputTool,
    },
  },
  {
    label: 'Plurals',
    params: {
      objectType: ObjectType.Language,
      view: View.Reports,
      reportID: ReportID.LanguagePlurals,
    },
  },
];

const NavBarToolsMenu: React.FC = () => {
  const areParamsCurrent = useAreParamsCurrent();

  return (
    <PopupCard
      buttonClassName="primary"
      buttonLabel="Tools"
      // Lots of hardcoded styles to override button differences
      buttonStyle={{ padding: '8px', fontSize: '20px', fontWeight: 'normal', border: 'none' }}
      justifyCard="left"
      body={
        <div className="flex flex-col gap-2 text-lg">
          {TOOLS.map((tool) => (
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
