import { LanguageData } from '@entities/language/LanguageTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';

type DrawableData = TerritoryData | LanguageData | LocaleData;

export default DrawableData;
