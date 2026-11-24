import {
  BookIcon,
  BookTextIcon,
  BotIcon,
  HashIcon,
  KeyboardIcon,
  LanguagesIcon,
  MonitorIcon,
  MonitorPcIcon,
  SpellCheckIcon,
} from 'lucide-react';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import { DigitalSupportCategory, DigitalSupportFactor } from './DigitalSupportTypes';

export function DigitalSupportCategoryIcon({ cat }: { cat: DigitalSupportCategory }) {
  switch (cat) {
    // Communication
    case DigitalSupportCategory.Display:
      return <MonitorIcon />;
    case DigitalSupportCategory.Keyboards:
      return <KeyboardIcon />;
    case DigitalSupportCategory.AssistiveTools:
      return <SpellCheckIcon />;

    // Content
    case DigitalSupportCategory.Documentation:
      return <BookTextIcon />;
    case DigitalSupportCategory.CurrencyAndDates:
      return <HashIcon />;
    case DigitalSupportCategory.MachineTranslation:
      return <LanguagesIcon />;

    // Interface
    case DigitalSupportCategory.OperatingSystems:
      return <MonitorPcIcon />;
    case DigitalSupportCategory.AIKnowledgeTools:
      return <BotIcon />;
    default:
      enforceExhaustiveSwitch(cat);
  }
}

export function DigitalSupportFactorIcon({ factor }: { factor: DigitalSupportFactor }) {
  // Some don't have reasonable images, use Lucide icons instead
  if (factor === DigitalSupportFactor.BooksPublishedAnnually)
    return <BookIcon className="size-4" />;
  else if (factor === DigitalSupportFactor.CLDR)
    return <div className="size-5 rounded bg-accent text-center text-[6px] leading-5">CLDR</div>;

  // Return the brand icon in most cases
  return (
    <img
      className="size-4"
      src={getDigitalSupportFactorIconURL({ factor })}
      alt={DigitalSupportFactor[factor]}
    />
  );
}

function getDigitalSupportFactorIconURL({ factor }: { factor: DigitalSupportFactor }) {
  switch (factor) {
    // Communication
    case DigitalSupportFactor.UnicodeEncoding:
      return 'https://www.unicode.org/webscripts/logo60s2.gif';

    case DigitalSupportFactor.Keyman:
      return 'https://keyman.com/cdn/deploy/img/icon-developer.92f73c5226b1e921aab3b0f824ea8119.png';
    case DigitalSupportFactor.Gboard:
      return 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Gboard_logo.svg';

    case DigitalSupportFactor.Grammarly:
      return 'https://images-eds-ssl.xboxlive.com/image?url=4rt9.lXDC4H_93laV1_eHHFT949fUipzkiFOBH3fAiZZUCdYojwUyX2aTonS1aIwMrx6NUIsHfUHSLzjGJFxxiq8rwXckZAP_inAe6ki68l0sLUKb2Yw4LHXM8Y1cGRavSPM3GiMCVHn.JhUi2E4a7p5YAonHoig58912BmnQUU-&format=source&h=307';
    case DigitalSupportFactor.QuillBot:
      return 'https://quillbot.com/rebrand/favicon.ico';
    case DigitalSupportFactor.LanguageTool:
      return 'https://languagetool.org/images/logo_color_with_background.svg';

    // Content
    case DigitalSupportFactor.BooksPublishedAnnually:
      return '';
    case DigitalSupportFactor.Wikipedia:
      return 'https://www.wikipedia.org/static/favicon/wikipedia.ico';
    case DigitalSupportFactor.UDHR:
      return 'https://upload.wikimedia.org/wikipedia/en/e/ea/United_Nations_Human_Rights_Council_Logo.svg';

    case DigitalSupportFactor.CLDR:
      return '';
    case DigitalSupportFactor.ICU:
      return 'https://www.unicode.org/announcements/ICU-logo.png';

    case DigitalSupportFactor.GTranslate:
      return 'https://www.gstatic.com/translate/favicon.ico';
    case DigitalSupportFactor.MSTranslator:
      return 'https://www.microsoft.com/en-us/translator/wp-content/themes/ro-translator/img/banner-app-icon.png';

    // Interfaces
    case DigitalSupportFactor.Win11:
      return 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_Windows_11.webp';
    case DigitalSupportFactor.macOS:
      return 'https://upload.wikimedia.org/wikipedia/commons/3/30/MacOS_logo.svg';
    case DigitalSupportFactor.iOS:
      return 'https://upload.wikimedia.org/wikipedia/commons/6/63/IOS_wordmark_%282017%29.svg';
    case DigitalSupportFactor.Android:
      return 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Android_robot_%282014-2019%29.svg';

    case DigitalSupportFactor.ClaudeSonnet:
      return 'https://claude.com/icon.svg';
  }
}
