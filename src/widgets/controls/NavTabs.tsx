import React, { ReactNode, useCallback } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import InternalLink from '@features/params/InternalLink';
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
          <InternalLink params={option.urlParams} key={option.label} keepOldParams={true}>
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
          </InternalLink>
        );
      })}
    </div>
  );
};

export default NavTabs;
