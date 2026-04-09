import React, { ReactNode, useCallback } from 'react';

import HoverableInternalLinkButton from '@features/layers/hovercard/HoverableInternalLinkButton';
import { PageParamsOptional } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

export type TabOption = {
  description?: ReactNode;
  label: string;
  urlParams: PageParamsOptional;
};

type Props = {
  label?: ReactNode;
  options: TabOption[];
};

const NavTabs: React.FC<Props> = ({ label, options }) => {
  const params = usePageParams();
  const getIsActive = useCallback(
    (option: TabOption) =>
      Object.entries(option.urlParams).every(
        ([key, value]) => params[key as keyof PageParamsOptional] === value,
      ),
    [params],
  );

  return (
    <div style={{ display: 'flex', marginBottom: '0.5em', width: '100%' }}>
      {label && <div style={{ padding: '0.5em 1em', border: 'none' }}>{label}</div>}
      {options.map((option) => {
        const isActive = getIsActive(option);
        return (
          <HoverableInternalLinkButton
            params={option.urlParams}
            key={option.label}
            keepOldParams={true}
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
          </HoverableInternalLinkButton>
        );
      })}
    </div>
  );
};

export default NavTabs;
