import React, { ReactNode, useCallback } from 'react';
import { Link } from 'react-router-dom';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import { getUpdateURL } from '@features/params/getNewURL';
import { PageParamsOptional } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

export type TabOption = {
  description?: ReactNode;
  label: string;
  urlParams: PageParamsOptional;
};

type Props = {
  options: TabOption[];
};

const NavTabs: React.FC<Props> = ({ options }) => {
  const params = usePageParams();
  const getIsActive = useCallback(
    (option: TabOption) =>
      Object.entries(option.urlParams).every(([key, value]) => params[key] === value),
    [params],
  );

  return (
    <div style={{ display: 'flex', marginBottom: '0.5em', width: '100%' }}>
      {options.map((option) => {
        const isActive = getIsActive(option);
        return (
          <Link to={getUpdateURL(option.urlParams)} key={option.label}>
            <HoverableButton
              className="tab"
              hoverContent={option.description}
              style={{
                padding: '0.5em 1em',
                color: isActive ? 'var(--color-button-primary)' : 'var(--color-text)',
                borderWidth: '2px',
                borderRadius: '0.5em 0.5em 0 0',
                borderBottomStyle: 'solid',
                borderBottomColor: isActive ? 'var(--color-button-primary)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {option.label}
            </HoverableButton>
          </Link>
        );
      })}
    </div>
  );
};

export default NavTabs;
