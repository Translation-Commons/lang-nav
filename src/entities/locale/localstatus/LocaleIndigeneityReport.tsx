import { CopyIcon } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';

import { ObjectType } from '@features/params/PageParamTypes';
import Selector from '@features/params/ui/Selector';
import useFilteredObjects from '@features/transforms/filtering/useFilteredObjects';

import { LocaleData } from '@entities/locale/LocaleTypes';

import CollapsibleReport from '@shared/containers/CollapsibleReport';
import LinkButton from '@shared/ui/LinkButton';

import LocaleIndigeneityTable from './LocaleIndigeneityTable';

enum IncludeCriteria {
  HasData = 'has data',
  MissingData = 'missing data',
  AnyLocale = 'any locale',
}

const LocaleIndigeneityReport: React.FC = () => {
  const locales = useFilteredObjects({})
    .filteredObjects.filter((l) => l.type === ObjectType.Locale)
    .filter((l) => !l.writingSystem && !l.variantTags && l.territory) as LocaleData[];

  const [includeCriteria, setIncludeCriteria] = React.useState(IncludeCriteria.MissingData);
  const viewedLocales = useMemo(
    () =>
      locales.filter((locale) => {
        const hasData = locale.langFormedHere != null && locale.historicPresence != null;
        if (includeCriteria === IncludeCriteria.AnyLocale) return true;
        if (includeCriteria === IncludeCriteria.HasData) return hasData;
        if (includeCriteria === IncludeCriteria.MissingData) return !hasData;
      }),
    [includeCriteria, locales.length], // Intentionally not memoizing on `locales` since when a locale is updated it would change state
  );

  const [changedLocales, setChangedLocales] = React.useState<LocaleData[]>([]);
  const addToChangedLocales = useCallback((locale: LocaleData) => {
    // If the state doesn't change at all a refresh does not happen
    setChangedLocales((prev) => (prev.includes(locale) ? [...prev] : [...prev, locale]));
  }, []);
  const copyChangedLocales = useCallback(() => {
    const clipboardText = changedLocales
      .filter((locale) => locale.langFormedHere != null || locale.historicPresence != null)
      .map((locale) =>
        [
          locale.languageCode,
          locale.territoryCode,
          locale.langFormedHere != null ? (locale.langFormedHere ? 1 : 0) : '',
          locale.historicPresence != null ? (locale.historicPresence ? 1 : 0) : '',
        ].join('\t'),
      )
      .join('\n');
    navigator.clipboard.writeText(clipboardText);
  }, [changedLocales]);

  return (
    <CollapsibleReport title={`Indigeneity Analysis (${includeCriteria} ${viewedLocales.length})`}>
      This report predicts if a locale is indigenous based on very coarse factors and compares
      against the data we have. As we add more complexity to the algorithm it may become more
      reliable. Predictions are shown in a lighter colored text than user-entered data. You can
      click the cycle button to accept a prediction, switch to the other state, or switch back to
      unknown. To save these changes to langnav, use the button at the bottom to copy the changed
      data and submit a PR to update
      <LinkButton href="https://github.com/Translation-Commons/lang-nav/blob/master/public/data/indigeneity.tsv">
        indigeneity.tsv
      </LinkButton>
      .
      <Selector<IncludeCriteria>
        selectorLabel="Include Locales that..."
        selected={includeCriteria}
        onChange={setIncludeCriteria}
        options={Object.values(IncludeCriteria)}
      />
      <LocaleIndigeneityTable locales={viewedLocales} addToChangedLocales={addToChangedLocales} />
      <button
        onClick={copyChangedLocales}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}
      >
        <CopyIcon size="1em" />
        Copy changed locales ({changedLocales.length})
      </button>
    </CollapsibleReport>
  );
};

export default LocaleIndigeneityReport;
