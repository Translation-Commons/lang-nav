import { LanguageData } from '@entities/language/LanguageTypes';

type DecoderResult = {
  input: string;
  lang?: LanguageData;
  alts?: LanguageData[];
};

export default DecoderResult;
