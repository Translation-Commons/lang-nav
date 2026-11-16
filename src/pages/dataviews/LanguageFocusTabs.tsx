import { EllipsisIcon } from 'lucide-react';
import React, { useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import useAreParamsCurrent from '@widgets/controls/useAreParamsCurrent';

import { getNewURLSearchParams } from '@features/params/getNewURLSearchParams';
import { getParamsForLanguageFocus, LanguageFocus } from '@features/params/LanguageFocus';
import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { EntityType } from '@entities/types/EntityTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import { partition } from '@shared/lib/setUtils';
import { cn } from '@shared/lib/utils';
import { Button, buttonVariants } from '@shared/ui/button';
import Deemphasized from '@shared/ui/Deemphasized';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

import { getModalityLabel } from '@strings/LanguageModalityStrings';
import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

const ITEM_LIMIT = 4;

const LanguageFocusTabs: React.FC = () => {
  const { entType } = usePageParams();
  const [oldParams] = useSearchParams({});
  const getIsActive = useAreParamsCurrent();
  const getNavTo = useCallback(
    (focus: LanguageFocus) => {
      const newParams = getNewURLSearchParams(getParamsForLanguageFocus(focus), oldParams);
      return '/' + LangNavPageName.Data + '?' + newParams;
    },
    [oldParams],
  );

  if (![EntityType.Language, EntityType.Locale].includes(entType)) return;

  const options = Object.values(LanguageFocus).map((focus) => ({
    description: <Description focus={focus} />,
    label: focus,
    urlParams: getParamsForLanguageFocus(focus),
  }));
  const paramsByFocus = Object.values(LanguageFocus).reduce(
    (acc, focus) => {
      acc[focus] = getParamsForLanguageFocus(focus);
      return acc;
    },
    {} as Record<LanguageFocus, Partial<PageParams>>,
  );

  const countShown = options.slice(0, ITEM_LIMIT - 1).some((o) => getIsActive(o.urlParams))
    ? ITEM_LIMIT
    : ITEM_LIMIT - 1;
  const [visibleOptions, hiddenOptions] = partition(
    Object.values(LanguageFocus),
    (focus) =>
      getIsActive(paramsByFocus[focus]) ||
      (Object.values(LanguageFocus).findIndex((v) => v === focus) ?? 10) < countShown,
  );

  return (
    <div className="flex flex-row gap-2 items-center text-xs ml-4">
      <div className="">Language Focus:</div>
      {visibleOptions.map((focus) => (
        <Link
          to={getNavTo(focus)}
          key={focus}
          data-slot="button"
          className={cn(
            buttonVariants({ variant: getIsActive(paramsByFocus[focus]) ? 'active' : 'outline' }),
          )}
        >
          {focus}
        </Link>
      ))}
      <HoverCard>
        <HoverCardTrigger delay={100}>
          <Button variant="ghost">
            <EllipsisIcon display="block" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-fit">
          <div className="flex flex-col gap-1 items-start">
            <div>other presets...</div>
            {hiddenOptions.map((focus) => (
              <Link
                to={getNavTo(focus)}
                key={focus}
                data-slot="button"
                className={cn(buttonVariants({ variant: 'ghost' }))}
              >
                {focus}
              </Link>
            ))}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

function getExtraExplanation(focus: LanguageFocus): string {
  switch (focus) {
    case LanguageFocus.SpokenLanguages:
      return 'Note LangNav does not yet have annotations for all spoken languages.';
    case LanguageFocus.WrittenLanguages:
      return 'Note LangNav does not yet have annotations for all written languages.';
    case LanguageFocus.DigitizedLanguages:
      return 'The table view will also show digital support & CLDR columns by default. Language codes shown will be in the CLDR format which is slightly different than the ISO definitions. For instance, `zh` will represent "Mandarin" not "Chinese" (in general) and `ms` will represent "Malay" not "Malayic" (including Indonesian).';
    case LanguageFocus.AllLanguages:
    case LanguageFocus.AllLanguoids:
    case LanguageFocus.Glottolog:
    case LanguageFocus.Dialects:
      return '';
    default:
      enforceExhaustiveSwitch(focus);
  }
}

function Description({ focus }: { focus: LanguageFocus }) {
  const pageParams = usePageParams();
  const urlParams = getParamsForLanguageFocus(focus);
  const { modalityFilter, languageScopes, languageSource, populationFocus } = urlParams;
  return (
    <>
      Limit the languages and language-like categories shown on the page to:
      {modalityFilter != null && (
        <div>
          <strong>Medium of Use</strong>:{' '}
          {modalityFilter.length ? (
            <>
              {(modalityFilter ?? pageParams.modalityFilter).map(getModalityLabel).join(', ')}
              <Deemphasized>
                {' '}
                (note: this filter is not configured for most languages with a population less than
                1 million)
              </Deemphasized>
            </>
          ) : (
            'Any'
          )}
        </div>
      )}
      {languageScopes != null && (
        <div>
          <strong>Scope</strong>:{' '}
          {languageScopes.length ? languageScopes.map(getLanguageScopeLabel).join(', ') : 'Any'}
        </div>
      )}
      {languageSource != null && (
        <div>
          <strong>Language List</strong>: {languageSource}
        </div>
      )}
      {populationFocus != null && (
        <div>
          <strong>Compute population focusing on people</strong>: {populationFocus}
        </div>
      )}
      <div>{getExtraExplanation(focus)}</div>
    </>
  );
}

export default LanguageFocusTabs;
