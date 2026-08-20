import { LanguageData } from '@entities/language/LanguageTypes';

type DecoderResult = {
  input: string;
  lang?: LanguageData;
  alts?: LanguageData[];
  codeWithMacro?: string;
};

export default DecoderResult;
