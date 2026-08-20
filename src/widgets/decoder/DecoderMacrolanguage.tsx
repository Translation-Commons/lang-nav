import { getObjectParents } from '@widgets/pathnav/getParentsAndDescendants';

import { ObjectType } from '@features/params/PageParamTypes';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

const OKAY_MACRO = ['mlt', 'mar', 'tgk'];

export function getDecoderMacroCode(
  lang?: LanguageData,
  code?: string,
): { codeWithMacro: string; parentLangs: LanguageData[] } | undefined {
  if (!lang || !code) return undefined;

  const languageParents = getObjectParents(lang).filter(
    (p) => p && p.type === ObjectType.Language,
  ) as LanguageData[];
  const iso639parents = languageParents.filter(
    (p) =>
      p.ISO.code && (p.scope === LanguageScope.Macrolanguage || p.scope === LanguageScope.Language),
  );

  if (!iso639parents.length) return; // If there is no macrolanguage or language parents, then there is no issue
  if (OKAY_MACRO.includes(code || '')) return undefined; // If the specific code is in the list of exceptions, don't warn
  return {
    codeWithMacro: [...iso639parents.map((p) => p.codeDisplay), code].join('/'),
    parentLangs: iso639parents,
  };
}
