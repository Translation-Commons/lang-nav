import { ReactNode } from 'react';

import PotentialLocalesTab from '@entities/locale/potential/PotentialLocalesTab';

import enforceExhaustiveness from '@shared/lib/enforceExhaustiveness';
import CodeDisplay from '@shared/ui/CodeDisplay';

export function getPotentialLocalesTabTitle(tab: PotentialLocalesTab): string {
  switch (tab) {
    case PotentialLocalesTab.Largest:
      return 'Largest';
    case PotentialLocalesTab.LargestLowCertainty:
      return 'Largest (Maybe)';
    case PotentialLocalesTab.Significant:
      return 'Significant';
    case PotentialLocalesTab.SignificantLowCertainty:
      return 'Significant (Maybe)';
    case PotentialLocalesTab.MissingOriginalPopData:
      return 'Save Pop Data';
    case PotentialLocalesTab.Unnecessary:
      return 'Unnecessary';
    default:
      enforceExhaustiveness(tab);
  }
}

export function PotentialLocalesTabDescription({ tab }: { tab: PotentialLocalesTab }): ReactNode {
  switch (tab) {
    case PotentialLocalesTab.Largest:
      return (
        <>
          Of all of the census records collected so far, these locales have more people speaking it
          than the other instantiated locales. This likely means the world population is indigenous
          to this country. However, since we do not have full census coverage it is very possible
          that the language is native to a different country without an inputted census record.
          Additionally, some of these locales are macrolanguages or constituents thereof, so we may
          actually have the language but represented by a different aspect.
        </>
      );
    case PotentialLocalesTab.LargestLowCertainty:
      return (
        <>
          The locales represent the largest population of a language in a territory, but a language
          or dialect of that locale is already present for that locale, so it may not be necessary
          or it may be a language family not consistently listed in other censuses.
          <div className="h-2" />
          For example, the Canadian [CA] census includes Indo-European [ine] as an entry. Since few
          censuses include Indo-European, it looks as if ine_CA is native to Canada. That is a data
          coverage issue -- not a real origin for the language group. Indo-European contains other
          languages that are listed in other parts of the same census like Italian eng_CA.
        </>
      );
    case PotentialLocalesTab.Significant:
      return (
        <>
          This is the list of locales native to other countries, but with a significant population
          in other countries.
        </>
      );
    case PotentialLocalesTab.SignificantLowCertainty:
      return (
        <>
          Locales in this table reflect languages that already have other locales in territories but
          a consistent presence of the same language not necessarily the same locale. For example,
          they may have an entry with a writing system specified.
        </>
      );
    case PotentialLocalesTab.MissingOriginalPopData:
      return (
        <div>
          The database stores locale data in <CodeDisplay>locales.tsv</CodeDisplay> and based on the
          initial data does some changes to make computed data like regional locales. That relies on
          having rough estimates before censuses are loaded and these locales are missing them in
          the original locale declaration.
        </div>
      );
    case PotentialLocalesTab.Unnecessary:
      return (
        <>
          Conversely, these locales are currently in the system but they appear to be outliers. For
          example, while it is interesting that there could be 20 Elvish speakers on Pandora --
          Pandora is known for its Navi and English speaking populations and Elvish is known for
          being in Middle Earth. As an extra datapoint that just takes up space, but for
          visualizations that makes them confusing because when someone asks for Elvish for some
          reason we pull up maps of both Middle Earth and Pandora -- when one population is unlike
          the other.
          <div className="h-2" />
          That all said, there could be data gaps, data parsing errors, or historical reasons to
          keep a locale designation.
        </>
      );
    default:
      enforceExhaustiveness(tab);
  }
}
