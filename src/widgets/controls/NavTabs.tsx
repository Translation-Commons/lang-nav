import { EllipsisIcon } from 'lucide-react';
import React, { ReactNode, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';

import { LangNavPageName } from '@app/PageRoutes';

import NewHoverable from '@features/layers/hovercard/NewHoverable';
import { getNewURLSearchParams } from '@features/params/getNewURLSearchParams';
import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import './tabs.css';

export type TabOption = {
  description?: ReactNode;
  label: string;
  urlParams: Partial<PageParams>;
};

type Props = {
  extendedOptionsLabel?: ReactNode;
  label?: ReactNode;
  options: TabOption[];
  size?: 'major' | 'minor';
};

const ITEM_LIMIT = 4;

const NavTabs: React.FC<Props> = ({ label, options, size = 'major', extendedOptionsLabel }) => {
  const params = usePageParams();
  const [oldParams] = useSearchParams({});
  const getIsActive = useCallback(
    (option: TabOption) =>
      Object.entries(option.urlParams).every(([key, value]) => {
        const paramValue = params[key as keyof PageParams];
        if (Array.isArray(paramValue) && Array.isArray(value)) {
          return paramValue.sort().join(';') === value.sort().join(';');
        }
        return paramValue === value;
      }),
    [params],
  );

  const countShown = options.slice(0, ITEM_LIMIT - 1).some(getIsActive)
    ? ITEM_LIMIT
    : ITEM_LIMIT - 1;
  const visibleOptions = options.filter(
    (option, index) => getIsActive(option) || index < countShown,
  );
  const hiddenOptions = options.filter(
    (option, index) => !getIsActive(option) && index >= countShown,
  );
  const getNavTo = useCallback(
    (option: TabOption) => {
      return '/' + LangNavPageName.Data + '?' + getNewURLSearchParams(option.urlParams, oldParams);
    },
    [oldParams],
  );

  return (
    <div className={'NavTabs ' + size}>
      {label && <div className="NavTabsLabel">{label}</div>}
      {visibleOptions.map((option) => (
        <Tab
          key={option.label}
          isActive={getIsActive(option)}
          description={option.description}
          label={option.label}
          navTo={getNavTo(option)}
        />
      ))}
      {hiddenOptions.length > 0 && (
        <NewHoverable
          hoverContent={
            <div className="Extended">
              {extendedOptionsLabel && <div className="NavTabsLabel">{extendedOptionsLabel}</div>}
              {hiddenOptions.map((option) => (
                <Tab
                  key={option.label}
                  isActive={getIsActive(option)}
                  label={option.label}
                  navTo={getNavTo(option)}
                />
              ))}
            </div>
          }
        >
          <button style={{ padding: '0.25em', cursor: 'pointer' }}>
            <EllipsisIcon display="block" />
          </button>
        </NewHoverable>
      )}
    </div>
  );
};

type TabOptionProps = {
  isActive: boolean;
  description?: ReactNode;
  label: string;
  navTo: string;
};

function Tab({ isActive, description, label, navTo }: TabOptionProps) {
  return (
    <NewHoverable
      hoverContent={description}
      className={'TabHoverable' + (isActive ? ' active' : '')}
      key={label}
    >
      <Link to={navTo} className="Tab">
        {label}
      </Link>
    </NewHoverable>
  );
}

export default NavTabs;
