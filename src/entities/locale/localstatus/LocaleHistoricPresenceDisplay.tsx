import Hoverable from '@features/layers/hovercard/Hoverable';

import Deemphasized from '@shared/ui/Deemphasized';

import { LocaleData } from '../LocaleTypes';

const LocaleHistoricPresenceDisplay = ({ loc }: { loc: LocaleData }) => {
  const { historicPresence } = loc;

  if (historicPresence == null) {
    return <Deemphasized>No data</Deemphasized>;
  }

  return (
    <Hoverable
      hoverContent={getHistoricPresenceDescription(historicPresence)}
      style={{ color: !historicPresence ? 'var(--color-text)' : undefined }}
    >
      {historicPresence ? 'Historic' : 'after 1500 CE'}
    </Hoverable>
  );
};

function getHistoricPresenceDescription(historicPresence: boolean | undefined) {
  if (historicPresence === true) {
    return 'This language or its precursors were established in this region before 1500 CE.';
  } else if (historicPresence === false) {
    return 'This language or its precursors were not established in this region before 1500 CE.';
  } else {
    return 'We do not currently have the data for when this language or its precursors were established in this region.';
  }
}

export function HistoricPresenceFieldDescription() {
  return (
    <>
      <b>Historic Presence</b>: The date of 1500 CE is used as a rough cutoff for when European
      colonization began to have a major impact on population distributions. We consider a permanent
      community for this criteria, not just limited exposure. For example, Arabic may have formed in
      the Arabian Peninsula, but it has had a historic role in North Africa for centuries before.
      Meanwhile Haitian Creole formed in the Caribbean but its antecedents were all in Africa and
      Europe before 1500 CE.
    </>
  );
}

export default LocaleHistoricPresenceDisplay;
