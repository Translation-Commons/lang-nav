import Hoverable from '@features/layers/hovercard/Hoverable';

import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { LocaleData } from './LocaleTypes';

const LocaleIndigeneityDisplay = ({ loc }: { loc: LocaleData }) => {
  const { langFormedHere, langHereBefore1500 } = loc;

  if (langFormedHere == null && langHereBefore1500 == null) {
    return <Deemphasized>No data</Deemphasized>;
  }

  return (
    <CommaSeparated>
      <Hoverable
        hoverContent={getLangFormedHereDescription(langFormedHere)}
        style={{
          color: !langFormedHere ? 'var(--color-text)' : undefined,
        }}
      >
        {langFormedHere ? 'Formed here' : 'From abroad'}
      </Hoverable>
      <Hoverable
        hoverContent={getLangHereBefore1500Description(langHereBefore1500)}
        style={{ color: !langHereBefore1500 ? 'var(--color-text)' : undefined }}
      >
        {langHereBefore1500 ? 'Historic' : 'after 1500 CE'}
      </Hoverable>
    </CommaSeparated>
  );
};

function getLangFormedHereDescription(langFormedHere: boolean | undefined) {
  if (langFormedHere === true) {
    return 'This language was formed by people in this region. It may have been formed in a distributed area but this is one of many key territories.';
  } else if (langFormedHere === false) {
    return 'This language came to this region after it was formed or standardized.';
  } else {
    return 'We do not currently have the data for when this language formed in this region.';
  }
}

function getLangHereBefore1500Description(langHereBefore1500: boolean | undefined) {
  if (langHereBefore1500 === true) {
    return 'This language or its precursors were established in this region before 1500 CE.';
  } else if (langHereBefore1500 === false) {
    return 'This language or its precursors were not established in this region before 1500 CE.';
  } else {
    return 'We do not currently have the data for when this language or its precursors were established in this region.';
  }
}

export function getIndigeneityDescription() {
  return (
    <>
      <p>
        Approximating if a language is indigenous to the region for this locale by measuring if it
        formed in the region and when it (or its antecedents) were established in the area. The
        notion of indigeneity is complex and involve subjective political judgments. Thereby we have
        2 objective criteria:
      </p>
      <p>
        <b>Formation</b>: Languages that form in a region include both naturally evolving languages
        as well as contact languages that could not be considered &quot;indigenous&quot; anywhere
        else since this formed in this place (eg. Swahili, Haitan Creole).
      </p>
      <p>
        <b>Historic Presence</b>: The date of 1500 CE is used as a rough cutoff for when European
        colonization began to have a major impact on population distributions. We consider a
        permanent community for this criteria, not just limited exposure. For example, Arabic may
        have formed in the Arabian Peninsula, but it has had a historic role in North Africa for
        centuries before. Meanwhile Haitian Creole formed in the Caribbean but its antecedents were
        all in Africa and Europe before 1500 CE.
      </p>
    </>
  );
}

export default LocaleIndigeneityDisplay;
