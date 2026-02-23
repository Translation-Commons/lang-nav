import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { LocaleData } from '../LocaleTypes';

import LocaleFormedHereDisplay, { LangFormedHereFieldDescription } from './LocaleFormedHereDisplay';
import LocaleHistoricPresenceDisplay, {
  HistoricPresenceFieldDescription,
} from './LocaleHistoricPresenceDisplay';

const LocaleIndigeneityDisplay = ({ loc }: { loc: LocaleData }) => {
  const { langFormedHere, historicPresence } = loc;

  if (langFormedHere == null && historicPresence == null) {
    return <Deemphasized>No data</Deemphasized>;
  }

  return (
    <CommaSeparated>
      <LocaleFormedHereDisplay loc={loc} />
      <LocaleHistoricPresenceDisplay loc={loc} />
    </CommaSeparated>
  );
};

export function getIndigeneityDescription() {
  return (
    <>
      <p>
        Approximating if a language is indigenous to the region for this locale by measuring if it
        formed in the region and when it (or its antecedents) were established in the area. The
        notion of indigeneity is complex and involves subjective political judgments. Thereby we
        have 2 objective criteria:
      </p>
      <p>
        <LangFormedHereFieldDescription />
      </p>
      <p>
        <HistoricPresenceFieldDescription />
      </p>
    </>
  );
}

export default LocaleIndigeneityDisplay;
