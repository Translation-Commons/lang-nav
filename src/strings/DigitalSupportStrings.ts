import {
  DigitalSupportDimension,
  DigitalSupportStatus,
} from '@entities/language/digitalsupport/DigitalSupportTypes';
import {
  DigitalSupportCategory,
  DigitalSupportFactor,
} from '@entities/tech/digitalSupport/DigitalSupportTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

export function getDigitalSupportDimensionLabel(dimension: DigitalSupportDimension): string {
  switch (dimension) {
    case DigitalSupportDimension.Overall:
      return 'Overall';
    case DigitalSupportDimension.Keyboards:
      return 'Keyboards';
    case DigitalSupportDimension.Documentation:
      return 'Documentation';
    case DigitalSupportDimension.I18nFrameworks:
      return 'I18n Frameworks';
    case DigitalSupportDimension.MachineTranslation:
      return 'Machine Translation';
    case DigitalSupportDimension.AI:
      return 'Artificial Intelligence';
    case DigitalSupportDimension.Interfaces:
      return 'Interfaces';
    default:
      enforceExhaustiveSwitch(dimension);
  }
}

export function getDigitalSupportStatusLabel(status: DigitalSupportStatus): string {
  switch (status) {
    case DigitalSupportStatus.Supported:
      return 'Supported';
    case DigitalSupportStatus.Partial:
      return 'Partially supported';
    case DigitalSupportStatus.NotSupported:
      return 'Not supported';
    case DigitalSupportStatus.Unknown:
      return 'Unknown';
    default:
      enforceExhaustiveSwitch(status);
  }
}

export function getDigitalSupportCategoryLabel(cat: DigitalSupportCategory): string {
  switch (cat) {
    case DigitalSupportCategory.Display:
      return 'Display';
    case DigitalSupportCategory.Keyboards:
      return 'Keyboards';
    case DigitalSupportCategory.AssistiveTools:
      return 'Assistive Tools';
    case DigitalSupportCategory.Documentation:
      return 'Documentation';
    case DigitalSupportCategory.CurrencyAndDates:
      return 'Currency & Dates';
    case DigitalSupportCategory.MachineTranslation:
      return 'Machine Translation';
    // case DigitalSupportCategory.Speech:
    //   return 'Speech';
    // case DigitalSupportCategory.Recommendation:
    //   return 'Recommendation';
    case DigitalSupportCategory.OperatingSystems:
      return 'Operating Systems';
    // case DigitalSupportCategory.SocialMedia:
    //   return 'Social Media';
    // case DigitalSupportCategory.PopularSoftware:
    //   return 'Popular Software';
    case DigitalSupportCategory.AIKnowledgeTools:
      return 'AI Knowledge Tools';
    default:
      enforceExhaustiveSwitch(cat);
  }
}

export function getDigitalSupportFactorLabel(factor: DigitalSupportFactor): string {
  switch (factor) {
    case DigitalSupportFactor.UnicodeEncoding:
      return 'Unicode Encoding';
    case DigitalSupportFactor.Keyman:
      return 'Keyman';
    case DigitalSupportFactor.Gboard:
      return 'Gboard - Google Keyboard';
    case DigitalSupportFactor.Grammarly:
      return 'Grammarly';
    case DigitalSupportFactor.QuillBot:
      return 'QuillBot';
    case DigitalSupportFactor.LanguageTool:
      return 'LanguageTool';
    case DigitalSupportFactor.BooksPublishedAnnually:
      return 'Books Published Annually';
    case DigitalSupportFactor.Wikipedia:
      return 'Wikipedia';
    case DigitalSupportFactor.UDHR:
      return 'UDHR - Universal Declaration of Human Rights';
    case DigitalSupportFactor.CLDR:
      return 'CLDR - Common Locale Data & Rules';
    case DigitalSupportFactor.ICU:
      return 'ICU - International Components for Unicode';
    case DigitalSupportFactor.GTranslate:
      return 'Google Translate';
    case DigitalSupportFactor.MSTranslator:
      return 'Microsoft Translator';
    case DigitalSupportFactor.Win11:
      return 'Windows 11';
    case DigitalSupportFactor.macOS:
      return 'macOS - Macintosh Operating System';
    case DigitalSupportFactor.iOS:
      return 'iOS - iPhone Operating System';
    case DigitalSupportFactor.Android:
      return 'Android';
    case DigitalSupportFactor.ClaudeSonnet:
      return 'Claude Sonnet';
    default:
      enforceExhaustiveSwitch(factor);
  }
}
