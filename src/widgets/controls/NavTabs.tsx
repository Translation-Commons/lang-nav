import React, { ReactNode, useCallback } from 'react';

import HoverableInternalLinkButton from '@features/layers/hovercard/HoverableInternalLinkButton';
import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import './tabs.css';

export type TabOption = {
  description?: ReactNode;
  label: string;
  urlParams: Partial<PageParams>;
};

type Props = {
  label?: ReactNode;
  options: TabOption[];
  size?: 'major' | 'minor';
};

const NavTabs: React.FC<Props> = ({ label, options, size = 'major' }) => {
  const params = usePageParams();
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

  return (
    <div className={'NavTabs ' + size}>
      {label && <div className="NavTabsLabel">{label}</div>}
      {options.map((option) => (
        <HoverableInternalLinkButton
          params={option.urlParams}
          key={option.label}
          keepOldParams={true}
          className={'Tab' + (getIsActive(option) ? ' active' : '')}
          hoverContent={option.description}
        >
          {option.label}
        </HoverableInternalLinkButton>
      ))}
    </div>
  );
};

export default NavTabs;
