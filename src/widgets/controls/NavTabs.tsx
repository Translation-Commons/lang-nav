import { EllipsisIcon } from 'lucide-react';
import React, { ReactNode, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';

import { LangNavPageName } from '@app/PageRoutes';

import NewHoverable from '@features/layers/hovercard/NewHoverable';
import { getNewURLSearchParams } from '@features/params/getNewURLSearchParams';
import { PageParams } from '@features/params/PageParamTypes';

import { Button } from '@shared/ui/button';
import './tabs.css';

import useAreParamsCurrent from './useAreParamsCurrent';

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
  const [oldParams] = useSearchParams({});
  const getIsActive = useAreParamsCurrent();

  const countShown = options.slice(0, ITEM_LIMIT - 1).some((o) => getIsActive(o.urlParams))
    ? ITEM_LIMIT
    : ITEM_LIMIT - 1;
  const visibleOptions = options.filter(
    (option, index) => getIsActive(option.urlParams) || index < countShown,
  );
  const hiddenOptions = options.filter(
    (option, index) => !getIsActive(option.urlParams) && index >= countShown,
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
          isActive={getIsActive(option.urlParams)}
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
                  isActive={getIsActive(option.urlParams)}
                  label={option.label}
                  navTo={getNavTo(option)}
                />
              ))}
            </div>
          }
        >
          <Button variant="outline" size="lg">
            <EllipsisIcon display="block" />
          </Button>
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
