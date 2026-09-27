import type { LanguageData } from '@entities/language/LanguageTypes';
import type { LocaleData } from '@entities/locale/LocaleTypes';
import type { TerritoryData } from '@entities/territory/TerritoryTypes';

type DrawableData = TerritoryData | LanguageData | LocaleData;

export default DrawableData;
