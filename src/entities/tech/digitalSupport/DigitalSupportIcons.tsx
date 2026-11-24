import {
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

import { DigitalSupportCategory } from './DigitalSupportTypes';

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
