import { EllipsisIcon } from 'lucide-react';
import React, { ReactNode, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';

import { LangNavPageName } from '@app/PageRoutes';

import useAreParamsCurrent from '@widgets/controls/useAreParamsCurrent';

import { getNewURLSearchParams } from '@features/params/getNewURLSearchParams';
import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { getEntityTypeLabelPlural } from '@entities/lib/getEntityName';
import { EntityType } from '@entities/types/EntityTypes';

import { toTitleCase } from '@shared/lib/stringUtils';
import { cn } from '@shared/lib/utils';
import { Button, buttonVariants } from '@shared/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

import EntityTypeDescription from '@strings/EntityTypeDescription';

const ITEM_LIMIT = 4;

const ORDERED_OBJECTS = [
  EntityType.Language,
  EntityType.Territory,
  EntityType.Locale,
  EntityType.WritingSystem,
  EntityType.Variant,
  EntityType.Keyboard,
  EntityType.Census,
  EntityType.Org,
  EntityType.Technology,
  EntityType.Orthography,
];

export type TabOption = {
  description?: ReactNode;
  label: string;
  urlParams: Partial<PageParams>;
};

const EntityTypeTabs: React.FC = () => {
  const { entType } = usePageParams();
  const [oldParams] = useSearchParams({});
  const getIsActive = useAreParamsCurrent();

  const options = ORDERED_OBJECTS.map((entType) => ({
    description: (
      <>
        <div style={{ marginBottom: '0.5em' }}>Click here to change the kind of entity viewed.</div>{' '}
        <EntityTypeDescription entType={entType} />
      </>
    ),
    label: toTitleCase(getEntityTypeLabelPlural(entType)),
    urlParams: { entType: entType },
  }));
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
      <Tabs value={entType}>
        <TabsList variant="line">
          {visibleOptions.map((option) => (
            <TabsTrigger
              nativeButton={false}
              key={option.label}
              value={option.urlParams.entType}
              render={(props) => <Link {...props} to={getNavTo(option)} />}
              className="text-md"
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <HoverCard>
        <HoverCardTrigger delay={100}>
          <Button variant="ghost" size="lg">
            <EllipsisIcon display="block" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-fit">
          <div className="flex flex-col gap-1 items-start">
            more types of data...
            {hiddenOptions.map((option) => (
              <Link
                to={getNavTo(option)}
                key={option.label}
                data-slot="button"
                className={cn(buttonVariants({ variant: 'ghost' }))}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default EntityTypeTabs;
