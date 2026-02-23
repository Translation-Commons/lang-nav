import Hoverable from '@features/layers/hovercard/Hoverable';
import Deemphasized from '@shared/ui/Deemphasized';
import { LocaleData } from '../LocaleTypes';

const LocaleFormedHereDisplay = ({ loc }: { loc: LocaleData }) => {
  const { langFormedHere } = loc;

  if (langFormedHere == null) {
    return <Deemphasized>No data</Deemphasized>;
  }

  return (
    <Hoverable
      hoverContent={getLangFormedHereDescription(langFormedHere)}
      style={{
        color: !langFormedHere ? 'var(--color-text)' : undefined,
      }}
    >
      {langFormedHere ? 'Formed here' : 'From abroad'}
    </Hoverable>
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

export function LangFormedHereFieldDescription() {
  return (
    <>
      <b>Formation</b>: Languages that form in a region include both naturally evolving languages as
      well as contact languages that could not be considered &quot;indigenous&quot; anywhere else
      since this formed in this place (eg. Swahili, Haitian Creole).
    </>
  );
}

export default LocaleFormedHereDisplay;
