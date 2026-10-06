import { EllipsisIcon } from 'lucide-react';
import React, { ReactNode, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';

import { LangNavPageName } from '@app/PageRoutes';

import { getNewURLSearchParams } from '@features/params/getNewURLSearchParams';
import { PageParams } from '@features/params/PageParamTypes';

import { Button } from '@shared/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

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

const NavTabs: React.FC<Props> = ({ label, options, size = 'major' }) => {
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
    <div className="flex flex-row gap-2">
      {label && <div className="text-md">{label}</div>}
      <Tabs>
        <TabsList variant={size == 'major' ? 'line' : undefined} className="border-bottom">
          {visibleOptions.map((option) => (
            <TabsTrigger
              key={option.label}
              value={option.label}
              render={(props) => <Link {...props} to={getNavTo(option)} />}
              className={size == 'major' ? 'text-md' : 'text-xs'}
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <HoverCard>
        <HoverCardTrigger delay={100}>
          <Button variant="outline" size="lg">
            <EllipsisIcon display="block" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-fit">
          <div className="flex flex-col gap-1">
            {hiddenOptions.map((option) => (
              <Link to={getNavTo(option)} key={option.label}>
                <Button variant="outline">{option.label}</Button>
              </Link>
            ))}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default NavTabs;
